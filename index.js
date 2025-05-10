const https = require('https');
const http = require('http');

const GROUP_ID = '34050513'; // Replace with your Roblox group ID
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1370834881361481850/c8hdqmxMDAH-pcMFlfRKEVW_RxfVgTHmmwcRtnh4xsmf0TZ6In4OxkcNHvP_XpZu162u'; // Replace with your Discord webhook URL
const GOAL = 100; // Your group member goal

let lastCount = null;

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

// Keep-alive server for Replit/UptimeRobot
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot is running');
}).listen(3000);

// Start checking
checkGroupCount();
setInterval(checkGroupCount, 10 * 1000); // Check every 10 seconds
