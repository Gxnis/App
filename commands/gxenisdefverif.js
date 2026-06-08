const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("gxenisdefverif")
        .setDescription("Définit ce salon comme salon de vérification")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // toi uniquement

    async execute(interaction) {
        const config = require("../config.json");

        config.verifChannel = interaction.channel.id;

        fs.writeFileSync("./config.json", JSON.stringify(config, null, 4));

        await interaction.reply({
            content: `✔️ Salon de vérification défini : <#${interaction.channel.id}>`,
            ephemeral: true
        });
    }
};
