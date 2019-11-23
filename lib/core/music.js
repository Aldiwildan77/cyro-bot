class MusicConstruct {
	constructor(message, voiceChannel) {
		this.textChannel = message.channel,
			this.voiceChannel = voiceChannel,
			this.connection = null,
			this.songs = [],
			this.volume = 5,
			this.playing = true
	}
}

module.exports = MusicConstruct
