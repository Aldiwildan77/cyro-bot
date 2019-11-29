const { Client, Util } = require('discord.js');
const client = new Client();

// config
const { credentials } = require('../../conf/config');

// Login to discord
client.login(credentials.discord_token)
	.then(() => {
		console.log('Successfully Logged In')
	})
	.catch(error => {
		console.error('Error Login : ', error);
	});

// core lib
const CommandRegistry = require('./command.registry');

// listeners
const HelpCommand = require('../listeners/help.listener');
const MusicCommand = require('../listeners/music.listener');
const UtilsCommand = require('../listeners/utils.listener');

// events
client.on('ready', () => {
	console.log('Logged in as %s\n', client.user.username);
	botPresence()
});

client.on('message', message => {
	const registry = new CommandRegistry(client, message);

	if (!registry.isUsingPrefix(message)) return;

	registry.registerMentionCommand('help', () => new HelpCommand(client, message).reply());
	registry.registerMentionCommand('music', () => new MusicCommand(client, message, Util).reply());
	registry.registerMentionCommand('join', () => new UtilsCommand(client, message).join());
	registry.registerMentionCommand('leave', () => new UtilsCommand(client, message).leave());
	registry.registerMentionCommand('ping', () => new UtilsCommand(client, message).ping())

});

client.on('warn', () => console.warn);

client.on('error', () => console.error);

client.on('reconnecting', () => console.log('I\'m reconnecting!'));

client.on('disconnect', () => console.log('I\'m just disconnected, i will reconnect now..'));

// utils
const botPresence = () => {
	client.user.setPresence({
		afk: false,
		game: {
			name: 'Cyro',
			type: 'STREAMING',
			url: 'https://www.youtube.com/watch?v=21X5lGlDOfg',
		},
		status: 'online',
	}).then(() => {
		console.log('Presence Already Set');
	}).catch(error => {
		console.error('Error Presence : ', error);
	})
};
