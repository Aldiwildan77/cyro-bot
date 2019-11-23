const Command = require('../core/command')

class UtilsCommand extends Command {
	constructor(bot, message) {
		super(bot, message)
		this.callerRoomVoiceChannel = this.message.member.voiceChannel
	}

	join() {
		this.callerRoomVoiceChannel.join()
			.then(() => console.log('connected'))
			.catch(error => console.error(error))
	}

	leave() { this.callerRoomVoiceChannel.leave() }

	ping() { this.message.channel.send('pong') }

}

module.exports = UtilsCommand
