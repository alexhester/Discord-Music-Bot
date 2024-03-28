const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const embed = new EmbedBuilder()
	.setColor(0x009950);
const embedError = new EmbedBuilder()
	.setColor(0xFF0000);

module.exports = {
    data: new SlashCommandBuilder()
	.setName('skip')
	.setDescription('Skip the currently playing track'),

    async execute(interaction) {
        const channel = interaction.member.voice.channel;
		// make sure we have a voice channel
		if (!channel) {
            embedError.setTitle('Join a voice channel.');
            return interaction.reply({ embeds: [embedError] });
        }
        const queue = useQueue(interaction.guild.id);
        if (!queue) {
            embed.setTitle('No music playing.');
            return interaction.reply({ embeds: [embed] });
        }
        if (queue) {
            queue.node.skip();
            embed.setTitle('Track skipped.');
            return interaction.reply({ embeds: [embed] });
        }
        else {
            embed.setDescription('Something went wrong');
            return interaction.reply({ embeds: [embed] });
        }
    },
};