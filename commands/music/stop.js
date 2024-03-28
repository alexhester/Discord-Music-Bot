const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const embed = new EmbedBuilder()
	.setColor(0x009950);
const embedError = new EmbedBuilder()
	.setColor(0xFF0000);

module.exports = {
    data: new SlashCommandBuilder()
	.setName('stop')
	.setDescription('Clear the queue and disconnect'),

    async execute(interaction) {
        const channel = interaction.member.voice.channel;
		// make sure we have a voice channel
		if (!channel) {
            embedError.setTitle('Join a voice channel.');
            return interaction.reply({ embeds: [embedError] });
        }
        else {
        const queue = useQueue(interaction.guild.id);
            queue.delete();
            embed.setTitle('Queue cleared.');
            return interaction.reply({ embeds: [embed] });
        }
    },
};