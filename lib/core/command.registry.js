const Command = require('./command')

class CommandRegistry extends Command {

	constructor(bot, message) {
		super(bot, message)
		this.commands = []
		this.prefixMessage = ','
	}

	isUsingPrefix(message) {
		return message.content.startsWith(this.prefixMessage)
	}

	registerMentionCommand(commandText, cb) {
		if (this.message.content) {
			const messageArray = this.message.content.match(this.splitPattern)

			// console.log(messageArray)

			if (messageArray) {
				const command = messageArray[0]
				if (_isCommandLowerCase(commandText, command)) {
					this.commands.push(command)
					cb()
				} else if (_isCommandAllCalled(commandText)) {
					if (this.commands.indexOf(command) < 0) {
						cb()
					}
				}
			}
		}
	}
}

const _isCommandLowerCase = (message, command) => {
	return message.toLowerCase() === command.toLowerCase()
}

const _isCommandAllCalled = message => {
	return message.toLowerCase() === '*'
}

module.exports = CommandRegistry
