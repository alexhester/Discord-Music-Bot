const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const embed = new EmbedBuilder()
    .setColor(0x009950);
const embedError = new EmbedBuilder()
	.setTitle('Something went wrong:')
	.setColor(0xFF0000);

module.exports = {
    data: new SlashCommandBuilder()
	.setName('filters')
	.setDescription('Enable or disable an audio filter')
	.addStringOption((option) =>
		option
			.setName('name')
			.setDescription('The name of the filter')
            .setRequired(true)
            .addChoices(
				{ name: 'Bassboost', value: 'bassboost' },
				{ name: 'Chorus', value: 'chorus' },
				{ name: 'Compressor', value: 'compressor' },
                { name: 'Dim', value: 'dim' },
                { name: 'Earrape', value: 'earrape' },
                { name: 'Expander', value: 'expander' },
                { name: 'Fadein', value: 'fadein' },
                { name: 'Flanger', value: 'flanger' },
                { name: 'Gate', value: 'gate' },
                { name: 'Haas', value: 'haas' },
                { name: 'Karaoke', value: 'karaoke' },
                { name: 'Lofi', value: 'lofi' },
                { name: 'Mcompand', value: 'mcompand' },
                { name: 'Mono', value: 'mono' },
                { name: 'Nightcore', value: 'nightcore' },
                { name: 'Normalizer', value: 'normalizer' },
                { name: 'Phaser', value: 'phaser' },
                { name: 'Pulsator', value: 'pulsator' },
                { name: 'Reverse', value: 'reverse' },
                { name: 'Softlimiter', value: 'softlimiter' },
                { name: 'Subboost', value: 'subboost' },
                { name: 'Surrounding', value: 'surrounding' },
                { name: 'Treble', value: 'treble' },
                { name: 'Vaporwave', value: 'vaporwave' },
                { name: 'Vibrato', value: 'vibrato' },
			),
	),
    async execute(interaction) {
        const channel = interaction.member.voice.channel;
        // make sure we have a voice channel
        if (!channel) {
            embedError.setTitle('Join a voice channel.');
            return interaction.reply({ embeds: [embedError] });
        }
        const queue = useQueue(interaction.guild.id);
        if (!queue) {
            try {
                embed.setTitle('No queue.');
                return interaction.reply({ embeds: [embed] });
            }
            catch (e) {
                embedError.setDescription(`${e}`);
                return interaction.editReply({ embeds: [embedError] });
            }
        }
        if (!queue.node.isPlaying) {
            try {
                embed.setTitle('No music currently playing.');
                return interaction.reply({ embeds: [embed] });
            }
            catch (e) {
                embedError.setDescription(`${e}`);
                return interaction.editReply({ embeds: [embedError] });
            }
        }
        if (queue.node.isPlaying) {
            try {
                const filterName = interaction.options.getString('name');

                queue.filters.ffmpeg.toggle(filterName);
                embed.setTitle(`Toggled the ${filterName} audio filter`);
                return interaction.reply({ embeds: [embed] });
            }
            catch (e) {
                embedError.setDescription(`${e}`);
                return interaction.reply({ embeds: [embedError] });
            }
        }
    },
};