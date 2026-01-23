const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// Debug: Log environment variables (without showing token)
console.log('Environment check:');
console.log('DISCORD_TOKEN:', process.env.DISCORD_TOKEN ? 'SET (hidden)' : 'NOT SET');
console.log('QUOTES_CHANNEL_ID:', process.env.QUOTES_CHANNEL_ID || 'NOT SET');
console.log('GENERAL_CHANNEL_ID:', process.env.GENERAL_CHANNEL_ID || 'NOT SET');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

async function postWeeklyQuote() {
    try {
        const quotesChannelId = process.env.QUOTES_CHANNEL_ID;
        const generalChannelId = process.env.GENERAL_CHANNEL_ID;
        
        if (!quotesChannelId || !generalChannelId) {
            console.error('Missing channel IDs in environment variables');
            process.exit(1);
        }
        
        const quotesChannel = await client.channels.fetch(quotesChannelId);
        const generalChannel = await client.channels.fetch(generalChannelId);
        
        if (!quotesChannel || !generalChannel) {
            console.error('Could not find one or both channels');
            process.exit(1);
        }
        
        // Fetch messages from the quotes channel
        const messages = await quotesChannel.messages.fetch({ limit: 100 });
        
        // Filter out bot messages and empty messages
        const validMessages = messages
            .filter(msg => !msg.author.bot && msg.content.trim().length > 0)
            .map(msg => msg);
        
        if (validMessages.length === 0) {
            console.log('No valid quotes found in the quotes channel');
            await generalChannel.send('No quotes available this week! 📝');
            clearTimeout(timeoutId);
            await client.destroy();
            process.exit(0);
        }
        
        // Pick a random message
        const randomQuote = validMessages[Math.floor(Math.random() * validMessages.length)];
        
        // Post to general channel
        await generalChannel.send({
            content: `📖 **Weekly Quote:**\n\n${randomQuote.content}`,
            embeds: randomQuote.embeds.length > 0 ? randomQuote.embeds : undefined
        });
        
        console.log(`Posted weekly quote from ${randomQuote.author.tag}`);
        clearTimeout(timeoutId);
        await client.destroy();
        process.exit(0);
    } catch (error) {
        console.error('Error posting weekly quote:', error);
        console.error('Error stack:', error.stack);
        if (client && !client.destroyed) {
            await client.destroy();
        }
        process.exit(1);
    }
}

client.once('ready', async () => {
    console.log(`Bot is ready! Logged in as ${client.user.tag}`);
    clearTimeout(timeoutId); // Clear timeout since we connected successfully
    await postWeeklyQuote();
});

// Handle login errors
client.on('error', (error) => {
    console.error('Discord client error:', error);
    process.exit(1);
});

// Set a timeout to prevent hanging
let timeoutId = setTimeout(() => {
    console.error('Timeout: Bot took too long to connect or post quote');
    console.error('This usually means the bot failed to connect to Discord');
    if (client && !client.destroyed) {
        client.destroy();
    }
    process.exit(1);
}, 60000); // 60 second timeout


// Check if token exists before logging in
if (!process.env.DISCORD_TOKEN) {
    console.error('ERROR: DISCORD_TOKEN is not set in environment variables');
    process.exit(1);
}

console.log('Attempting to login to Discord...');
client.login(process.env.DISCORD_TOKEN).catch((error) => {
    console.error('Failed to login:', error.message);
    process.exit(1);
});
