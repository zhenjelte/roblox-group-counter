const express = require('express');
const https = require('https');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const GROUP_ID = '34050513'; // Replace with your Roblox group ID
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1370834881361481850/c8hdqmxMDAH-pcMFlfRKEVW_RxfVgTHmmwcRtnh4xsmf0TZ6In4OxkcNHvP_XpZu162u'; // Replace with your Discord webhook URL
const GOAL = 100; // Your group member goal

let lastCount = null;

// Function to fetch JSON data
function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// Function to post an embed message to Discord webhook
function postToWebhookEmbed(count, remaining, goal) {
    const data = JSON.stringify({
        embeds: [
            {
                color: 0x436cc8, // Theme color
                description: `🐳 Oceanu now has **${count.toLocaleString()} members!**\n> **${remaining.toLocaleString()}** more members until we reach our goal of **${goal.toLocaleString()}!**`,
                footer: {
                    text: 'Live counter made by Zhen-Jelte'
                },
                timestamp: new Date().toISOString()
            }
        ]
    });

    const url = new URL(WEBHOOK_URL);

    const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    const req = https.request(options, res => {
        res.on('data', () => {});
    });

    req.on('error', console.error);
    req.write(data);
    req.end();
}

// Function to check group member count
async function checkGroupCount() {
    try {
        const groupData = await fetchJSON(`https://groups.roblox.com/v1/groups/${GROUP_ID}`);
        const count = groupData.memberCount;

        if (count !== lastCount) {
            lastCount = count;

            const remaining = GOAL - count;
            postToWebhookEmbed(count, remaining, GOAL);
            console.log('Posted new count:', count);
        }
    } catch (err) {
        console.error('Error fetching group data:', err);
    }
}

// Express server with keep-alive endpoints
app.get('/', (req, res) => {
    res.json({ status: 'Bot is running', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', uptime: process.uptime() });
});

// Start Express server
app.listen(PORT, () => {
    console.log(`Keep-alive server is running on port ${PORT}`);
});

// Start checking
checkGroupCount();
setInterval(checkGroupCount, 10 * 1000); // Check every 10 seconds

