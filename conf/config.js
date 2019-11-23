const NODE_ENV = process.env.NODE_ENV || 'development'
if (NODE_ENV === 'development') require('dotenv').config()

const credentials = {
	discord_token: process.env.AUTH_TOKEN,
	youtube_token: process.env.YOUTUBE_TOKEN,
}

module.exports = { credentials }
