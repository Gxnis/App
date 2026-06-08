const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("gxenisverifset")
        .setDescription("Active le système de vérification")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const config = require("../config.json");

        if (!config.verifChannel)
            return interaction.reply({ content: "❌ Tu dois d'abord définir un salon avec /gxenisdefverif", ephemeral: true });

        config.verifEnabled = true;
        fs.writeFileSync("./config.json", JSON.stringify(config, null, 4));

        await interaction.reply({ content: "✔️ Système de vérification activé !", ephemeral: true });

        const channel = interaction.guild.channels.cache.get(config.verifChannel);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("gxenis_verify")
                .setLabel("Se faire vérifier")
                .setStyle(ButtonStyle.Success)
        );

        await channel.send({
            content: "🎉 **Vérification des membres**\nClique sur le bouton ci-dessous pour être vérifié.",
            components: [row]
        });
    }
};
