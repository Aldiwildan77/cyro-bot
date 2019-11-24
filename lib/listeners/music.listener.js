const Command = require('../core/command')
const MusicConstruct = require('../core/music')

const { credentials } = require('../../conf/config')

const YouTube = require('simple-youtube-api')
const ytdl = require('ytdl-core')

const youtube = new YouTube(credentials.youtube_token)
const musics = new Map()

class MusicCommand extends Command {
	constructor(bot, message, Util) {
		super(bot, message)

		this.Util = Util
		this.youtubeUrl = 'https://www.youtube.com/watch?v='
		this.className = 'music'
		this.urlYoutubePattern = /^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/
		this.reason = {
			endMusic: 'Stream is not generating quickly enough.',
			skipMusic: 'Music Skip!',
			stopMusic: 'Music Stop!',
		}

		this.messageArray = this.message.content.split(' ')
		this.firstCommand = this.messageArray[0]
		this.secondCommand = this.messageArray[1]
		this.thirdCommand = Array.from(this.messageArray, (val, index) => { if (index >= 2) { return val } }).join(' ').trimLeft()

		this.selectedMusicTimeOut = 10000
		this.selectedMusicMax = 1
		this.selectedMusicMaxMatches = 1
		this.normalizeVolume = 5
		this.serverQueue = musics.get(this.message.guild.id)
	}

	reply() {
		if (!this.firstCommand.includes(this.className)) {
			return
		}

		switch (this.secondCommand) {
			case 'pl': case 'play': this.play(this.thirdCommand)
				break
			case 'ps': case 'pause': this.pause()
				break
			case 'rs': case 'resume': this.resume()
				break
			case 's': case 'skip': this.skip()
				break
			case 'st': case 'stop': this.stop()
				break
			case 'np': case 'now': this.nowPlaying()
				break
			case 'q': case 'queue': this.queue()
				break
			default:
				break
		}
	}

	async play(params) {
		const voiceChannel = await this.message.member.voiceChannel
		const url = params ? await params.replace(/<(.+)>/g, '$1') : ''
		let video

		console.log(url)

		if (!voiceChannel) {
			return this.message.channel.send('I\'m sorry but you need to be in a voice channel to play music!')
		}

		if (!this.thirdCommand) {
			return this.message.channel.send('I\'m sorry but you need to entry an **URL** or **Title** to play music!')
		}

		// const permissions = voiceChannel.permissionFor(this.message.client.user)
		// if (!permissions.has('CONNECT')) {
		// 	return this.message.channel.send('I cannot connect to your voice channel, make sure I have the proper permissions!')
		// }
		// if (!permissions.has('SPEAK')) {
		// 	return this.message.channel.send('I cannot speak in this voice channel, make sure I have the proper permissions!')
		// }

		if (url.match(this.urlYoutubePattern)) {
			const playlist = await youtube.getPlaylist(url)
			const videos = await playlist.getVideos()
			for (const v in Object.values(videos)) {
				const secondVideo = await youtube.getVideoByID(v.id)
				await this.videoHandler(secondVideo, this.message, voiceChannel, true)
			}

			return this.message.channel.send(`✅ Playlist: **${playlist.title}** has been added to the queue!`)
		} else {
			// console.log('first exec')
			try {
				video = await youtube.getVideo(url)
			} catch (error) {
				// console.log('second exec')
				try {
					const videos = await youtube.searchVideos(url, 10)
					let index = 0
					this.message.channel.send(`\`\`\`SONG SELECTION : \n\n${videos.map(res => `${++index} - ${res.title}`).join('\n')} \n\nPlease provide a value to select one of the search results ranging from 1-10. \`\`\``)
					let response
					try {
						response = await this.chooseVideoHandler()
						// console.log('respon ' + response.first())
					} catch (err) {
						return this.message.channel.send('No or invalid value entered, cancelling video selection.')
					}
					const videoIndex = parseInt(response.first())
					video = await youtube.getVideoByID(videos[videoIndex - 1].id)
				} catch (err) {
					return this.message.channel.send('🆘 I could not obtain any search results.')
				}
			}
			return this.videoHandler(video, this.message, voiceChannel)
		}
	}

	async pause() {
		if (!this.message.member.voiceChannel) return this.message.channel.send('You are not in a voice channel!')
		if (!this.serverQueue) return this.message.channel.send('There is nothing playing that I could pause for you.')
		if (this.serverQueue && this.serverQueue.playing) {
			this.serverQueue.playing = false
			this.serverQueue.connection.dispatcher.pause()
			return this.message.channel.send(`:pause_button: Music paused: **${this.serverQueue.songs[0].title}**`)
		}
	}

	async resume() {
		if (!this.message.member.voiceChannel) return this.message.channel.send('You are not in a voice channel!')
		if (!this.serverQueue) return this.message.channel.send('There is nothing playing that I could pause for you.')
		if (this.serverQueue && !this.serverQueue.playing) {
			this.serverQueue.playing = true
			this.serverQueue.connection.dispatcher.resume()
			console.log('resume')
			return this.message.channel.send(`:play_pause:  Music resumed: **${this.serverQueue.songs[0].title}**`)
		}
	}

	async skip() {
		if (!this.message.member.voiceChannel) return this.message.channel.send('You are not in a voice channel!')
		if (!this.serverQueue) return this.message.channel.send('There is nothing playing that I could skip for you.')
		this.serverQueue.connection.dispatcher.end(this.reason.skipMusic)
		return undefined
	}

	async stop() {
		if (!this.message.member.voiceChannel) return this.message.channel.send('You are not in a voice channel!')
		if (!this.serverQueue) return this.message.channel.send('There is nothing playing that I could stop for you.')
		this.serverQueue.songs = [];
		this.serverQueue.connection.dispatcher.end(this.reason.stopMusic)
		return undefined
	}

	async nowPlaying() {
		if (!this.serverQueue) return this.message.channel.send('There is nothing to play.')

		this.message.channel.send(`🎶 Now playing: **${this.serverQueue.songs[0].title}**`)
	}

	async queue() {
		if (!this.serverQueue) return this.message.channel.send('Songs queue is empty.')

		let index = 0
		this.message.channel.send(`SONG QUEUE: \n\n${this.serverQueue.songs.map(res => `**${++index}** - **${res.title}** `).join('\n')} `)
	}

	async chooseVideoHandler() {
		return await this.message.channel.awaitMessages(msg => msg.content > 0 && msg.content <= 10, {
			max: this.selectedMusicMax,
			maxMatches: this.selectedMusicMaxMatches,
			time: this.selectedMusicTimeOut,
			errors: ['time'],
		})
			.then(result => result)
			.catch(() => undefined)
	}

	async videoHandler(video, message, voiceChannel, playlist = false) {
		const song = { id: video.id, title: this.Util.escapeMarkdown(video.title), url: this.youtubeUrl + video.id }

		if (this.serverQueue) {
			this.serverQueue.songs.push(song)
			if (playlist) return undefined
			else return message.channel.send(`✅ ** ${song.title} ** has been added to the queue!`)
		} else {
			const musicConstruct = new MusicConstruct(message, voiceChannel)
			musics.set(message.guild.id, musicConstruct)
			musicConstruct.songs.push(song)
			try {
				const connection = await voiceChannel.join()
				musicConstruct.connection = connection
				// console.log(connection)
				this.player(message.guild, musicConstruct.songs[0])
			} catch (error) {
				console.error(`I could not join the voice channel: ${error}`)
				musics.delete(message.guild.id)
				return message.channel.send('Could not to join the voice channel')
			}
		}

		return undefined
	}

	async player(guild, song) {
		const serverQueue = await musics.get(guild.id)
		if (!song) {
			this.message.member.voiceChannel.leave()
			musics.delete(guild.id)
			return
		}

		const stream = ytdl(song.url, { filter: 'audioonly' })
		const streamOptions = { seek: '0' }
		const dispatcher = serverQueue.connection.playStream(stream, streamOptions)
			.on('end', reason => {
				this.playerEndReason(reason)
				serverQueue.songs.shift()
				this.player(guild, serverQueue.songs[0])
			})
			.on('error', error => console.error(error))

		await dispatcher.setVolumeLogarithmic(serverQueue.volume / this.normalizeVolume)
		serverQueue.textChannel.send(`🎶 Start playing: ** ${song.title} ** `)
	}

	async playerEndReason(reason) {
		switch (reason) {
			case this.reason.endMusic:
				console.log('Song Ended.')
				break
			case this.reason.skipMusic:
				console.log(this.reason.skipMusic)
				break
			case this.reason.stopMusic:
				console.log(this.reason.stopMusic)
				break
			default:
				break
		}
	}
}

module.exports = MusicCommand
