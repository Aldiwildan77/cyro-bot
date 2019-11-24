const Express = require('express')
const app = Express()

// start discord bot engine
require('./lib/core/engine')

const { NODE_ENV, PORT } = require('./conf/config')

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
