const Express = require('express')
const http = require('http')
const app = Express()

// start discord bot engine
require('./lib/core/engine')

const { NODE_ENV, PORT, HOSTNAME } = require('./conf/config')

// keep heroku server alive
const countdown = 20 * 60 * 1000
setInterval(() => {
	http.get(HOSTNAME)
	console.log('calling heroku server')
}, countdown)

// Endpoint
app.get('/', (req, res) => {
	res.status(200).json({
		status: 'success',
		message: 'Hi everyone, enjoy your life',
	})
})

app.use((req, res, next) => {
	const error = new Error('Not Found - ' + req.originalUrl)
	res.status(404)
	next(error)
})

app.use((error, req, res) => {
	res.status(res.status || 500)
	res.json({
		message: error.message,
		error: NODE_ENV === 'production' ? {} : error.stack,
	})
})

app.listen(PORT, () => console.log('Server is running at PORT %s', PORT))
