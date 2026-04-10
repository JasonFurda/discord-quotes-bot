/**
 * Fetches every message in a text-based channel (paginated Discord API).
 */
async function fetchAllMessages(channel) {
    const allMessages = new Map();
    let lastId;
    let hasMore = true;
    while (hasMore) {
        const options = { limit: 100 };
        if (lastId) options.before = lastId;
        const batch = await channel.messages.fetch(options);
        if (batch.size === 0) break;
        batch.forEach((msg) => allMessages.set(msg.id, msg));
        lastId = batch.last().id;
        hasMore = batch.size === 100;
    }
    return Array.from(allMessages.values());
}

function isValidQuoteMessage(msg) {
    return !msg.author.bot && msg.content.trim().length > 0;
}

function filterValidQuotes(messages) {
    return messages.filter(isValidQuoteMessage);
}

function filterBySubstring(messages, search) {
    const needle = search.trim().toLowerCase();
    if (!needle) return [];
    return messages.filter((m) => m.content.toLowerCase().includes(needle));
}

function pickRandom(array) {
    if (array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
}

module.exports = {
    fetchAllMessages,
    filterValidQuotes,
    filterBySubstring,
    pickRandom,
};
