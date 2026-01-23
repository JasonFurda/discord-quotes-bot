const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`Bot is ready! Logged in as ${client.user.tag}`);
    
    // Schedule the weekly quote posting
    // This runs every Monday at 9:00 AM (adjust timezone and day as needed)
    // Format: minute hour day-of-month month day-of-week
    // '0 9 * * 1' = Monday at 9:00 AM
    cron.schedule('0 9 * * 1', async () => {
        await postWeeklyQuote();
    }, {
        timezone: "America/New_York" // Change this to your timezone
    });
    
    console.log('Weekly quote scheduler initialized');
});

async function postWeeklyQuote() {
    try {
        const quotesChannelId = process.env.QUOTES_CHANNEL_ID;
        const generalChannelId = process.env.GENERAL_CHANNEL_ID;
        
        if (!quotesChannelId || !generalChannelId) {
            console.error('Missing channel IDs in environment variables');
            return;
        }
        
        const quotesChannel = await client.channels.fetch(quotesChannelId);
        const generalChannel = await client.channels.fetch(generalChannelId);
        
        if (!quotesChannel || !generalChannel) {
            console.error('Could not find one or both channels');
            return;
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
            return;
        }
        
        // Pick a random message
        const randomQuote = validMessages[Math.floor(Math.random() * validMessages.length)];
        
        // Post to general channel
        await generalChannel.send({
            content: `📖 **Weekly Quote:**\n\n${randomQuote.content}`,
            embeds: randomQuote.embeds.length > 0 ? randomQuote.embeds : undefined
        });
        
        console.log(`Posted weekly quote from ${randomQuote.author.tag}`);
    } catch (error) {
        console.error('Error posting weekly quote:', error);
    }
}

// Optional: Add a command to manually trigger a quote post
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    // Check if the message is a command to post a quote manually
    if (message.content === '!postquote' || message.content === '!weeklyquote') {
        // Check if user has permission (optional - you can remove this check)
        if (message.member.permissions.has('ManageMessages')) {
            await postWeeklyQuote();
            await message.reply('Quote posted! ✅');
        } else {
            await message.reply('You do not have permission to use this command.');
        }
    }
});

client.login(process.env.DISCORD_TOKEN);

