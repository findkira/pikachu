const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const fs = require("fs");
const path = require("path");
const http = require("http");

// Load variables from Render's environment settings
const apiId = parseInt(process.env.API_ID, 10);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.STRING_SESSION || "");

const commands = new Map();

function loadPlugins() {
    const pluginsDir = path.join(__dirname, "plugins");
    if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir);

    const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith(".js"));

    for (const file of files) {
        const plugin = require(path.join(pluginsDir, file));
        if (plugin.command) {
            commands.set(plugin.command, plugin);
        }
    }
    console.log(`Loaded ${commands.size} customized plugins.`);
}

(async () => {
    loadPlugins();

    if (!apiId || !apiHash || !process.env.STRING_SESSION) {
        console.error("Missing credentials! Ensure API_ID, API_HASH, and STRING_SESSION are set.");
        process.exit(1);
    }

    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });

    // Connect automatically using the session string
    await client.connect();
    console.log("Pikachu Userbot Engine Connected!");

    // Send startup message to Saved Messages
    await client.sendMessage("me", { message: "Pikachu Started ✓" });

    client.addEventHandler(async (event) => {
        const message = event.message;
        if (!message || !message.text || !message.out) return;

        if (message.text.startsWith(".")) {
            const cmdName = message.text.slice(1).split(" ")[0].toLowerCase();
            const args = message.text.split(" ").slice(1);

            if (commands.has(cmdName)) {
                try {
                    await commands.get(cmdName).execute(client, message, args);
                } catch (error) {
                    console.error("Error executing plugin:", error);
                }
            }
        }
    }, new NewMessage({}));
})();

// Health-check HTTP server to keep Render's free web service running
const PORT = process.env.PORT || 8080;
http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Pikachu Userbot status: Active");
}).listen(PORT, () => {
    console.log(`Keep-alive web server running on port ${PORT}`);
});
