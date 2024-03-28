const { ActivityType, Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const { Player } = require('discord-player');
const { YoutubeExtractor } = require('@discord-player/extractor');
const { token, ytCookie, botChannel, clientId, guildId } = require('./config.json');
const fs = require('node:fs');
const client = new Client({
	intents: [
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
	],
});

// Load Commands
const commands = [];
client.commands = new Collection();
fs.readdirSync('./commands/').forEach((dir) => {
    const commandFiles = fs.readdirSync(`./commands/${dir}`).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${dir}/${file}`);
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
		console.log(`Loading Command: /${command.data.name}`);
    }
});

// Register Commands
client.once('ready', async function() {
    console.log('Registering Commands...');
    const rest = new REST({ version: '10' }).setToken(token);
    try {
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
		await rest.put(Routes.applicationCommands(clientId), { body: commands });
        console.log('Success');
    }
	catch (e) {
        console.error(e);
    }
	client.user.setPresence({
		activities: [{
			name: botChannel,
			type: ActivityType.Listening,
		}],
		status: 'online',
	});
	console.log(`${client.user.tag} is online`);
});

// Initialize Player
const player = new Player(client, {
	ytdlOptions: {
		filter: 'audioonly',
		highWaterMark: 1 << 30,
		dlChunkSize: 0,
		requestOptions: {
			headers: {
				cookie: ytCookie,
			},
		},
	},
});
client.player = player;
player.extractors.register(YoutubeExtractor, {});

// Player Events
player.events.on('playerStart', (queue) => {
	client.user.setPresence({
		activities: [{
			name: `${queue.currentTrack.title}`,
			type: ActivityType.Playing,
		}],
		status: 'online',
	});
	},
);
player.events.on('emptyQueue', () => {
    client.user.setPresence({
		activities: [{
			name: botChannel,
			type: ActivityType.Listening,
		}],
		status: 'online',
	});
});
player.events.on('connectionDestroyed', () => {
    client.user.setPresence({
		activities: [{
			name: botChannel,
			type: ActivityType.Listening,
		}],
		status: 'online',
	});
});

// Load Client Events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, commands));
    }
	else {
        client.on(event.name, (...args) => event.execute(...args, commands));
    }
	console.log(`Loading Event: ${file}`);
}

client.login(token);