# Discord Quotes Bot

A small [discord.js](https://discord.js.org/) v14 bot that exposes two slash commands: post a random quote from a dedicated quotes channel, or a random quote whose text contains a word or name (case-insensitive).

## Features

- `/quote` — picks a random non-bot, non-empty message from the quotes channel and posts it where you ran the command
- `/quotename` — same pool, filtered by substring match on `name` (case-insensitive); friendly message if nothing matches
- No database: quotes are whatever message history exists in the quotes channel

## Discord setup

### Application and bot

1. Open the [Discord Developer Portal](https://discord.com/developers/applications) and create an application (or use an existing one).
2. Under **Bot**, add a bot user and copy the **Token** → use as `DISCORD_TOKEN`.
3. Under **OAuth2 → General**, copy **Client ID** → use as `CLIENT_ID`.
4. Under **Bot**, enable the **Message Content Intent** (required to read quote text).

### Invite URL

Under **OAuth2 → URL Generator**:

- Scopes: **bot**, **applications.commands**
- Bot permissions (minimum practical set):
  - View channels
  - Send messages
  - Read message history

Use the generated URL to add the bot to your server.

### Channel ID

Enable Developer Mode (User Settings → Advanced), then right-click the quotes channel → **Copy Channel ID** → `QUOTES_CHANNEL_ID`.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_TOKEN` | Yes | Bot token |
| `QUOTES_CHANNEL_ID` | Yes | Source channel for quotes |
| `CLIENT_ID` | For registration | Application (client) ID |
| `GUILD_ID` | No | If set, `npm run register-commands` registers commands only in this server (fast while developing). If unset, commands are registered globally |

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

## Install and register slash commands

```bash
npm install
```

Register commands **whenever you change** `register-commands.js` (or the command definitions inside it):

```bash
npm run register-commands
```

- With `GUILD_ID` in `.env`, updates appear in that guild immediately.
- Without `GUILD_ID`, commands are global and may take up to about an hour to show in all servers.

## Run the bot

```bash
npm start
```

This runs `node bot.js`. Keep the process running (see Ubuntu below).

## Running on Ubuntu (production-practical)

Example using Node 20 LTS from NodeSource or your distro, and a systemd service.

```bash
# Install Node.js 20+ if needed, then:
cd /path/to/discord-quotes-bot
npm install
cp .env.example .env
# edit .env with nano/vim
npm run register-commands   # once per deploy / when commands change
npm start                   # or use systemd below
```

**systemd user service** (`~/.config/systemd/user/discord-quotes-bot.service`):

```ini
[Unit]
Description=Discord quotes bot
After=network-online.target

[Service]
Type=simple
WorkingDirectory=/path/to/discord-quotes-bot
EnvironmentFile=/path/to/discord-quotes-bot/.env
ExecStart=/usr/bin/node bot.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=default.target
```

Then:

```bash
systemctl --user daemon-reload
systemctl --user enable --now discord-quotes-bot.service
journalctl --user -u discord-quotes-bot.service -f
```

(Use a system unit under `/etc/systemd/system/` if you prefer a system-wide service and adjust `User=` / paths accordingly.)

## Troubleshooting

- **Slash commands missing**: Run `npm run register-commands` with correct `DISCORD_TOKEN` and `CLIENT_ID`. For global registration, wait or set `GUILD_ID` for instant guild commands.
- **Bot cannot read quotes**: Enable **Message Content Intent** in the portal; ensure the bot can see the quotes channel and has **Read message history**.
- **“Could not load the quotes channel”**: Check `QUOTES_CHANNEL_ID` and channel type (must be a text-based channel with messages).
