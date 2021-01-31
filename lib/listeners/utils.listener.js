const Command = require('../core/command');

class UtilsCommand extends Command {
	constructor(bot, message) {
		super(bot, message);
		this.callerRoomVoiceChannel = !this.message.member.voiceChannel ? '' : this.message.member.voiceChannel;
	}

	join() {
		if (!this.callerRoomVoiceChannel || this.callerRoomVoiceChannel == '') {
			return this.message.reply('I\'m sorry but you need to be in a voice channel');
		}

		this.callerRoomVoiceChannel.join()
			.then(() => console.log('Connected'))
			.catch(error => console.error(error));
	}

	leave() {
		this.callerRoomVoiceChannel.leave();
	}

	ping() {
		this.message.reply('pong');
	}

}

module.exports = UtilsCommand;
