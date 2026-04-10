/**
 * Registers slash commands with Discord (run after changing command definitions).
 * Uses GUILD_ID if set (updates instantly in that server); otherwise registers globally (up to ~1h to propagate).
 */
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
    new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Post a random quote from the quotes channel'),
    new SlashCommandBuilder()
        .setName('quotename')
        .setDescription('Post a random quote containing the given word or name')
        .addStringOption((option) =>
            option
                .setName('name')
                .setDescription('Word or name to search for')
                .setRequired(true)
        ),
].map((c) => c.toJSON());

async function main() {
    const token = process.env.DISCORD_TOKEN;
    const clientId = process.env.CLIENT_ID;
    const guildId = process.env.GUILD_ID;

    if (!token) {
        console.error('Missing DISCORD_TOKEN in environment (.env or shell).');
        process.exit(1);
    }
    if (!clientId) {
        console.error('Missing CLIENT_ID (Application ID) in environment.');
        process.exit(1);
    }

    const rest = new REST({ version: '10' }).setToken(token);

    try {
        if (guildId) {
            console.log(`Registering ${commands.length} command(s) to guild ${guildId}...`);
            await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
            console.log('Guild commands registered.');
        } else {
            console.log(`Registering ${commands.length} global command(s)...`);
            await rest.put(Routes.applicationCommands(clientId), { body: commands });
            console.log('Global commands registered (may take up to an hour to appear everywhere).');
        }
    } catch (err) {
        console.error('Failed to register commands:', err);
        process.exit(1);
    }
}

main();
