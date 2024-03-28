const { EmbedBuilder } = require('discord.js');
const embedError = new EmbedBuilder()
	.setTitle('Something went wrong:')
	.setColor(0xFF0000);

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) {
			return;
		}
		console.log(interaction);

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}
		try {
			await command.execute(interaction);
		}
		catch (e) {
			console.error(e);
			if (interaction.replied || interaction.deferred) {
				embedError.setDescription(`${e}`);
				await interaction.followUp({ embeds: [embedError] });
			}
			else {
				embedError.setDescription(`${e}`);
				await interaction.reply({ embeds: [embedError] });
			}
		}
    },
};