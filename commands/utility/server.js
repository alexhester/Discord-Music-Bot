const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
	.setName('server')
	.setDescription('Display info about this server'),
async execute(interaction) {
	const embed = new EmbedBuilder()
		.setColor(0x009950)
		.setTitle(`Server name: ${interaction.guild.name}`)
		.setDescription(`Total members: ${interaction.guild.memberCount}`);
	return interaction.reply({ embeds: [embed] });
},
};