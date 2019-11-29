const Command = require('../core/command');

const HELP_TEXT = '```Help Message : ```';

class HelpCommand extends Command {
	constructor(bot, message, type) {
		super(bot, message);
		this.type = type;
	}

	reply() {
		this.message.channel.send(HELP_TEXT)
	}
}

module.exports = HelpCommand;
