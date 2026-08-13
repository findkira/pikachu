const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const input = require("input");
const fs = require("fs");
const path = require("path");

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
    console.log("⚡ Welcome to Pikachu Terminal Setup ⚡\n");
    loadPlugins();

    // Get API Credentials
    const apiIdInput = process.env.API_ID || await input.text("Enter your API_ID: ");
    const apiId = parseInt(apiIdInput, 10);
    
    const apiHash = process.env.API_HASH || await input.text("Enter your API_HASH: ");
    
    // Initialize Session
    const stringSession = new StringSession(process.env.STRING_SESSION || "");

    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });

    // Start the Client (Triggers terminal prompts for OTP if session is empty)
    await client.start({
        phoneNumber: async () => await input.text("Enter your Telegram number (e.g., +91...): "),
        password: async () => await input.text("Enter your 2FA password (if you have one): "),
        phoneCode: async () => await input.text("Enter the Telegram login code: "),
        onError: (err) => console.log(err),
    });

    console.log("\n✅ Pikachu Userbot Engine Connected!");
    
    // Save and display the generated session for cloud deployment
    const savedSession = client.session.save();
    if (savedSession && !process.env.STRING_SESSION) {
        console.log("\n⚠️ IMPORTANT: Here is your STRING_SESSION. Never share it with anyone !. Save it for Render deployment:");
        console.log("============================================================");
        console.log(savedSession);
        console.log("============================================================\n");
    }

    await client.sendMessage("me", { message: "Pikachu Started from Terminal ✓" });

    // Listen for Commands
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
