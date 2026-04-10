const {
    Client,
    GatewayIntentBits,
    Events,
} = require('discord.js');
require('dotenv').config();

const {
    fetchAllMessages,
    filterValidQuotes,
    filterBySubstring,
    pickRandom,
} = require('./quotes');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

function getQuotesChannelId() {
    return process.env.QUOTES_CHANNEL_ID;
}

function logConfigProblems() {
    const missing = [];
    if (!process.env.DISCORD_TOKEN) missing.push('DISCORD_TOKEN');
    if (!getQuotesChannelId()) missing.push('QUOTES_CHANNEL_ID');
    if (missing.length) {
        console.error(
            `Missing required environment variable(s): ${missing.join(', ')}. Set them in .env or the process environment.`
        );
    }
}

async function resolveQuotesChannel() {
    const id = getQuotesChannelId();
    if (!id) {
        console.error('QUOTES_CHANNEL_ID is not set.');
        return null;
    }
    try {
        const channel = await client.channels.fetch(id);
        if (!channel) {
            console.error(`Could not fetch channel ${id}.`);
            return null;
        }
        if (!channel.isTextBased() || !('messages' in channel)) {
            console.error(`Channel ${id} is not a text-based channel with message history.`);
            return null;
        }
        return channel;
    } catch (err) {
        console.error(`Failed to fetch quotes channel ${id}:`, err.message || err);
        return null;
    }
}

async function loadValidQuotes() {
    const quotesChannel = await resolveQuotesChannel();
    if (!quotesChannel) return { error: 'channel', quotes: [] };

    const all = await fetchAllMessages(quotesChannel);
    const quotes = filterValidQuotes(all);
    return { error: null, quotes };
}

function quotePayload(message) {
    return {
        content: message.content,
        embeds: message.embeds?.length ? message.embeds : undefined,
    };
}

client.once(Events.ClientReady, (c) => {
    logConfigProblems();
    console.log(`Ready as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'quote') {
        await interaction.deferReply();
        try {
            const { error, quotes } = await loadValidQuotes();
            if (error === 'channel') {
                await interaction.editReply({
                    content:
                        'I could not load the quotes channel. Check QUOTES_CHANNEL_ID and that I can see that channel.',
                });
                return;
            }
            if (quotes.length === 0) {
                await interaction.editReply({
                    content: 'There are no quotes yet — add some non-empty messages in the quotes channel (not from bots).',
                });
                return;
            }
            const chosen = pickRandom(quotes);
            await interaction.editReply(quotePayload(chosen));
        } catch (err) {
            console.error('Error handling /quote:', err);
            await interaction.editReply({
                content: 'Something went wrong fetching a quote. Try again in a moment.',
            });
        }
        return;
    }

    if (interaction.commandName === 'quotename') {
        await interaction.deferReply();
        const rawName = interaction.options.getString('name', true);
        if (!rawName.trim()) {
            await interaction.editReply({
                content: 'Please provide a word or name to search for.',
            });
            return;
        }

        try {
            const { error, quotes } = await loadValidQuotes();
            if (error === 'channel') {
                await interaction.editReply({
                    content:
                        'I could not load the quotes channel. Check QUOTES_CHANNEL_ID and that I can see that channel.',
                });
                return;
            }
            if (quotes.length === 0) {
                await interaction.editReply({
                    content: 'There are no quotes yet — add some non-empty messages in the quotes channel (not from bots).',
                });
                return;
            }

            const matches = filterBySubstring(quotes, rawName);
            if (matches.length === 0) {
                const preview =
                    rawName.trim().length > 80
                        ? `${rawName.trim().slice(0, 80)}…`
                        : rawName.trim();
                await interaction.editReply({
                    content: `No quotes found containing **${preview}** (case-insensitive). Try a different word.`,
                });
                return;
            }

            const chosen = pickRandom(matches);
            await interaction.editReply(quotePayload(chosen));
        } catch (err) {
            console.error('Error handling /quotename:', err);
            await interaction.editReply({
                content: 'Something went wrong searching quotes. Try again in a moment.',
            });
        }
    }
});

if (!process.env.DISCORD_TOKEN) {
    console.error('Missing DISCORD_TOKEN. Set it in .env or the process environment.');
    process.exit(1);
}

client.login(process.env.DISCORD_TOKEN).catch((err) => {
    console.error('Login failed:', err.message || err);
    process.exit(1);
});
