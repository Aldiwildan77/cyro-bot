class Command {
	constructor(bot, message) {
		this.bot = bot,
		this.message = message
		this.splitPattern = /\w+|"[^"]+"|'[^']+'/g
	}
}

module.exports = Command
