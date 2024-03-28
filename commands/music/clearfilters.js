const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const embed = new EmbedBuilder()
    .setColor(0x009950);
const embedError = new EmbedBuilder()
	.setTitle('Something went wrong:')
	.setColor(0xFF0000);

module.exports = {
    data: new SlashCommandBuilder()
	.setName('clearfilters')
	.setDescription('Removes all audio filters'),

    async execute(interaction) {
        const channel = interaction.member.voice.channel;
        // make sure we have a voice channel
        if (!channel) {
            embedError.setTitle('Join a voice channel.');
            return interaction.reply({ embeds: [embedError] });
        }
        const queue = useQueue(interaction.guild.id);

        if (!queue.node.isPlaying) {
            embed.setTitle('No music currently playing.');
            return interaction.reply({ embeds: [embed] });
        }
        else {
            try {
                const filters = queue.filters.ffmpeg.getFiltersEnabled();

                if (!filters.length) {
                    embed.setTitle('No audio filter is applied currently.');
                    return interaction.reply({ embeds: [embed] });
                }
                queue.filters.ffmpeg.setFilters(false);
                embed.setTitle('Cleared all audio filters.');
                return interaction.reply({ embeds: [embed] });
            }
            catch (e) {
                embedError.setDescription(`${e}`);
                return interaction.reply({ embeds: [embedError] });
            }
        }
    },
};