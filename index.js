const {
    Client,
    GatewayIntentBits,
    Collection,
    Partials,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Events
} = require("discord.js");
const fs = require("fs");
const express = require("express");
const config = require("./config.json");
require("dotenv").config();

// =========================
//  CRÉATION DU CLIENT
// =========================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences
    ],
    partials: [Partials.Channel]
});

// =========================
//  CHARGEMENT DES COMMANDES
// =========================
client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
    const cmd = require(`./commands/${file}`);
    if (cmd.data && cmd.execute) {
        client.commands.set(cmd.data.name, cmd);
    }
}

// =========================
//  BOT PRÊT (nouveau nom d’event)
// =========================
client.once(Events.ClientReady, () => {
    console.log(`🚀 Bot connecté : ${client.user.tag}`);
});

// =========================
//  GESTION DES COMMANDES
// =========================
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;

    try {
        await cmd.execute(interaction);
    } catch (err) {
        console.error(err);
        // ephemeral deprecated → on utilise flags
        if (interaction.deferred || interaction.replied) {
            await interaction.followUp({
                content: "❌ Une erreur est survenue.",
                flags: 64
            });
        } else {
            await interaction.reply({
                content: "❌ Une erreur est survenue.",
                flags: 64
            });
        }
    }
});

// =========================
//  GESTION DU BOUTON DE VÉRIFICATION
// =========================
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId !== "gxenis_verify") return;

    if (!config.verifEnabled) return;

    const member = interaction.member;

    // =========================
    //  VÉRIFICATION DU STATUT PERSONNALISÉ
    // =========================
    const customStatus = member.presence?.activities?.find(a => a.type === 4);

    if (
        !customStatus ||
        !customStatus.state ||
        !customStatus.state.toLowerCase().includes("gxnis")
    ) {
        return interaction.reply({
            content: "❌ Tu dois mettre **gxnis** dans ton statut personnalisé (À quoi pensez‑vous en ce moment ?) pour être vérifié.",
            flags: 64
        });
    }

    // =========================
    //  DONNER LE RÔLE
    // =========================
    const role = interaction.guild.roles.cache.find(r => r.name === "Membre");
    if (!role) {
        return interaction.reply({
            content: "⚠️ Le rôle **Membre** n'existe pas.",
            flags: 64
        });
    }

    await member.roles.add(role);

    // =========================
    //  MESSAGE PUBLIC DANS LE SALON
    // =========================
    const channel = interaction.guild.channels.cache.get(config.verifChannel);
    if (channel) {
        await channel.send({
            content: `✔️ <@${member.id}> a été vérifié !`
        });
    }

    // =========================
    //  MESSAGE PRIVÉ AU MEMBRE
    // =========================
    return interaction.reply({
        content: "🎉 Tu es maintenant vérifié et tu as reçu le rôle **Membre** !",
        flags: 64
    });
});

// =========================
//  ANTI-CRASH
// =========================
process.on("unhandledRejection", err => console.error("Unhandled Rejection:", err));
process.on("uncaughtException", err => console.error("Uncaught Exception:", err));

// =========================
//  EXPRESS POUR RENDER
// =========================
const app = express();
app.get("/", (req, res) => res.send("Bot is running"));
app.listen(process.env.PORT || 3000, () => {
    console.log("🌐 Serveur Express actif pour Render");
});

// =========================
//  CONNEXION DU BOT
// =========================
client.login(process.env.TOKEN);
