const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const embed = new EmbedBuilder()
	.setColor(0x009950);
const embedList = new EmbedBuilder()
	.setColor(0x009950);
const embedError = new EmbedBuilder()
	.setTitle('Something went wrong:')
	.setColor(0xFF0000);

module.exports = {
	data: new SlashCommandBuilder()
	.setName('play')
	.setDescription('Play a track or add to queue')
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
			embedError.setAuthor({ name: 'Couldn\'t find tracks for:' });
			embedError.setTitle(`${query}`);
			return interaction.editReply({ embeds: [embedError] });
		}
		if (searchResult.playlist) {
			try {
				embedList.setFields();
				embedList.setTitle(`Playlist: ${searchResult.tracks[0].playlist.title}`);
				embedList.setURL(`${searchResult.tracks[0].playlist.url}`);
				embedList.setThumbnail(searchResult.tracks[0].thumbnail);
				embedList.addFields(
					{ name: 'Tracks:', value: `${searchResult.tracks.length}`, inline: true },
					);
				await interaction.editReply({ embeds: [embedList] });
			}
			catch (e) {
                embedError.setDescription(`${e}`);
                return interaction.editReply({ embeds: [embedError] });
			}
		}
		if (!searchResult.playlist) {
			try {
				embed.setFields();
				embed.setTitle(`${searchResult.tracks[0].title}`);
				embed.setURL(`${searchResult.tracks[0].url}`);
				embed.setThumbnail(searchResult.tracks[0].thumbnail);
				embed.addFields(
					{ name: 'Duration:', value: `${searchResult.tracks[0].duration}`, inline: true },
					{ name: 'Views:', value: `${searchResult.tracks[0].views}`, inline: true },
					{ name: 'Uploaded by:', value: `${searchResult.tracks[0].author}`, inline: true },
					);
				await interaction.editReply({ embeds: [embed] });
			}
			catch (e) {
				embedError.setDescription(`${e}`);
				return interaction.editReply({ embeds: [embedError] });
			}
		}
		try {
			await player.play(channel, searchResult, {
				nodeOptions: {
					leaveOnEnd: false,
					leaveOnEmpty: true,
					leaveOnStop: false,
					selfDeaf: true,
					skipOnNoStream: true,
				},
				// we can access this metadata object using queue.metadata later on
				metadata: {
					channel: interaction.channel,
					requestedBy: interaction.user,
					client: interaction.guild.members.me,
				},
			});
			return;
		}
		catch (e) {
			embedError.setDescription(`${e}`);
			return interaction.editReply({ embeds: [embedError] });
		}
	},
};