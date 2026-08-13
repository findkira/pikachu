const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const fs = require("fs");
const path = require("path");
const http = require("http");

// Load core credentials
const apiId = parseInt(process.env.API_ID, 10);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.STRING_SESSION || "");

// Load configuration variables with default fallbacks
const MODE = (process.env.MODE || "private").toLowerCase();
const STATUS = (process.env.STATUS || "on").toLowerCase();
const AUTO_READ = (process.env.AUTO_READ || "off").toLowerCase();
const AUTO_REPLY_STATUS = (process.env.AUTO_REPLY_STATUS || "off").toLowerCase();
const AUTO_REPLY = process.env.AUTO_REPLY || "I am currently unavailable.";
const PREFIX = process.env.PREFIX || ".";

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
        console.error("Missing credentials. Ensure API_ID, API_HASH, and STRING_SESSION are set.");
        process.exit(1);
    }

    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });

    await client.connect();
    console.log("Pikachu Userbot Engine Connected.");

    await client.sendMessage("me", { message: "Pikachu Started" });

    client.addEventHandler(async (event) => {
        // Halt all processing if the bot status is set to off
        if (STATUS === "off") return;

        const message = event.message;
        if (!message || !message.text) return;

        const isFromMe = message.out;

        // Auto-Read Implementation
        if (!isFromMe && AUTO_READ === "on") {
            try {
                await client.markAsRead(message.chatId);
            } catch (error) {
                console.error("Failed to mark chat as read:", error);
            }
        }

        // Auto-Reply Implementation (Restricted to private messages)
        if (!isFromMe && AUTO_REPLY_STATUS === "on" && message.isPrivate) {
            try {
                await client.sendMessage(message.chatId, { message: AUTO_REPLY });
            } catch (error) {
                console.error("Failed to send auto-reply:", error);
            }
        }

        // Command Router
        if (message.text.startsWith(PREFIX)) {
            // Block public command usage if MODE is set to private
            if (MODE === "private" && !isFromMe) return;

            const cmdName = message.text.slice(PREFIX.length).split(" ")[0].toLowerCase();
            const args = message.text.split(" ").slice(1);

            if (commands.has(cmdName)) {
                const plugin = commands.get(cmdName);

                // Block non-owners from executing owner-only plugins
                if (plugin.isOwner && !isFromMe) return;

                try {
                    await plugin.execute(client, message, args);
                } catch (error) {
                    console.error("Error executing plugin:", error);
                }
            }
        }
    }, new NewMessage({}));
})();

const PORT = process.env.PORT || 8080;
http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Pikachu Userbot status: Active");
}).listen(PORT, () => {
    console.log(`Keep-alive web server running on port ${PORT}`);
});
