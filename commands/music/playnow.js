const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { useMainPlayer, useQueue } = require('discord-player');
const embed = new EmbedBuilder()
	.setColor(0x009950);
const embedError = new EmbedBuilder()
	.setTitle('Something went wrong:')
	.setColor(0xFF0000);

module.exports = {
	data: new SlashCommandBuilder()
	.setName('playnow')
	.setDescription('Play a track immediately')
	.addStringOption((option) =>
		option
			.setName('query')
			.setDescription('Enter a song name or url')
			.setRequired(true),
	),
	async execute(interaction) {
		const channel = interaction.member.voice.channel;
		// make sure we have a voice channel
		if (!channel) {
			embedError.setTitle('Join a voice channel.');
            return interaction.reply({ embeds: [embedError] });
		}
		// we need input/query to play
		const query = interaction.options.getString('query', true);

        // let's defer the interaction as things can take time to process
		await interaction.deferReply();
		// Get the player instance
		const player = useMainPlayer();
		const searchResult = await player.search(query, { requestedBy: interaction.user });

		if (!searchResult.hasTracks()) {
			// If player didn't find any songs for this query
			embed.setAuthor({ name: 'Couldn\'t find tracks for:' });
			embed.setTitle(`${query}`);
			return interaction.editReply({ embeds: [embed] });
        }
        const queue = useQueue(interaction.guild.id);

		if (searchResult.playlist) {
			embed.setTitle('Use /play for playlists');
			return interaction.editReply({ embeds: [embed] });
		}

        if (!queue) {
            try {
                await player.play(channel, searchResult, {
                    nodeOptions: {
						leaveOnEnd: false,
						leaveOnEmpty: true,
						leaveOnStop: false,
					},
					// we can access this metadata object using queue.metadata later on
					metadata: {
						channel: interaction.channel,
					},
                });
                embed.setTitle(`${searchResult.tracks[0].title}`);
				embed.setURL(`${searchResult.tracks[0].url}`);
				embed.setAuthor({ name: 'Now Playing:' });
                embed.setDescription(`${searchResult.tracks[0].author}`);
				embed.setFooter({ text: `Duration: ${searchResult.tracks[0].duration}` });
				return interaction.editReply({ embeds: [embed] });
            }
            catch (e) {
                embedError.setDescription(`${e}`);
                return interaction.editReply({ embeds: [embedError] });
            }
        }
		else {
			try {
				await player.play(channel, searchResult, {
                    nodeOptions: {
						leaveOnEnd: false,
						leaveOnEmpty: true,
						leaveOnStop: false,
					},
					// we can access this metadata object using queue.metadata later on
					metadata: {
						channel: interaction.channel,
					},
                });
                queue.node.insert(searchResult.tracks[0], 0);
                queue.node.skipTo(0);
                embed.setTitle(`${searchResult.tracks[0].title}`);
				embed.setURL(`${searchResult.tracks[0].url}`);
				embed.setAuthor({ name: 'Now Playing:' });
                embed.setDescription(`${searchResult.tracks[0].author}`);
				embed.setFooter({ text: `Duration: ${searchResult.tracks[0].duration}` });
				return interaction.editReply({ embeds: [embed] });
            }
            catch (e) {
                embedError.setDescription(`${e}`);
                return interaction.editReply({ embeds: [embedError] });
            }
        }
    },
};