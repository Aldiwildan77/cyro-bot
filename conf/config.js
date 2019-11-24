const NODE_ENV = process.env.NODE_ENV || 'development'
if (NODE_ENV === 'development') require('dotenv').config()

const credentials = {
	discord_token: process.env.AUTH_TOKEN,
	youtube_token: process.env.YOUTUBE_TOKEN,
}

const PORT = process.env.PORT
const HOSTNAME = process.env.HOSTNAME || 'localhost'

module.exports = { credentials, PORT, HOSTNAME, NODE_ENV }
