# Discord Quotes Bot

A Discord bot that automatically posts a random quote from a quotes channel to the general channel once a week.

## Features

- 📅 Automatically posts a quote every Monday at 9:00 AM (configurable)
- 🎲 Randomly selects from available quotes in the quotes channel
- 🤖 Manual trigger command: `!postquote` or `!weeklyquote` (requires Manage Messages permission)
- 🚫 Filters out bot messages and empty messages

## Setup Instructions

### 1. Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section
4. Click "Add Bot" and confirm
5. Under "Token", click "Reset Token" and copy the token
6. Enable the following Privileged Gateway Intents:
   - Message Content Intent (required to read message content)

### 2. Invite Bot to Your Server

1. Go to the "OAuth2" > "URL Generator" section
2. Select the "bot" scope
3. Select the following bot permissions:
   - Read Messages/View Channels
   - Send Messages
   - Read Message History
4. Copy the generated URL and open it in your browser to invite the bot

### 3. Get Channel IDs

1. Enable Developer Mode in Discord:
   - User Settings > Advanced > Enable Developer Mode
2. Right-click on your quotes channel and select "Copy ID"
3. Right-click on your general channel and select "Copy ID"

### 4. Install Dependencies

```bash
npm install
```

### 5. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
2. Edit `.env` and fill in:
   - `DISCORD_TOKEN`: Your bot token from step 1
   - `QUOTES_CHANNEL_ID`: The ID of your quotes channel
   - `GENERAL_CHANNEL_ID`: The ID of your general channel

### 6. Run the Bot

```bash
npm start
```

## Customization

### Change Schedule

Edit the cron schedule in `bot.js`:
- Current: `'0 9 * * 1'` (Monday at 9:00 AM)
- Format: `minute hour day-of-month month day-of-week`
- Example: `'0 12 * * 5'` = Friday at 12:00 PM

### Change Timezone

Edit the timezone in the cron.schedule options:
```javascript
timezone: "America/New_York" // Change to your timezone
```

### Change Message Format

Edit the message content in the `postWeeklyQuote()` function:
```javascript
await generalChannel.send({
    content: `📖 **Weekly Quote:**\n\n${randomQuote.content}`,
    // ...
});
```

## Commands

- `!postquote` or `!weeklyquote` - Manually trigger a quote post (requires Manage Messages permission)

## GitHub Actions Hosting (Recommended for 24/7)

To host the bot on GitHub Actions so it runs automatically without keeping your computer on:

### Setup Steps

1. **Push your code to GitHub**
   - Create a new repository on GitHub
   - Push your code to the repository

2. **Add GitHub Secrets**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret" and add:
     - `DISCORD_TOKEN`: Your Discord bot token
     - `QUOTES_CHANNEL_ID`: Your quotes channel ID
     - `GENERAL_CHANNEL_ID`: Your general channel ID

3. **Configure the Schedule**
   - Edit `.github/workflows/post-quote.yml`
   - Adjust the cron expression to match your desired time
   - GitHub Actions uses UTC time, so convert accordingly
   - Example: `'0 14 * * 1'` = Monday at 9:00 AM EST (14:00 UTC)

4. **Enable Workflows**
   - Go to Actions tab in your repository
   - The workflow will run automatically on schedule
   - You can also manually trigger it using "Run workflow"

### Important Notes

- **GitHub Actions is free** for public repositories
- The bot runs on a schedule, not continuously (no real-time commands)
- Each run posts one quote and then exits
- You can manually trigger runs from the GitHub Actions tab

## Troubleshooting

- **Bot doesn't respond**: Make sure Message Content Intent is enabled in the Discord Developer Portal
- **Can't find channels**: Verify the channel IDs are correct and the bot has access to those channels
- **No quotes posted**: Check that there are messages in the quotes channel (non-bot messages with content)
- **GitHub Actions not running**: Check that workflows are enabled in repository settings

