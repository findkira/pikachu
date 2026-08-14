const { exec } = require("child_process");

module.exports = {
    command: "update",
    description: "Update the bot (Works on Termux and Render)",
    isOwner: true,

    execute: async (client, message, args) => {
        const isFromMe = message.out;
        const isRender = process.env.RENDER === "true"; // Render automatically sets this
        const deployHook = process.env.DEPLOY_HOOK;

        const sendReply = async (text) => {
            if (isFromMe) {
                await message.edit({ text });
            } else {
                await client.sendMessage(message.chatId, { message: text });
            }
        };

        await sendReply("⚡ Checking for updates...");

        // -----------------------------------------
        // RENDER DEPLOYMENT LOGIC
        // -----------------------------------------
        if (isRender) {
            if (!deployHook) {
                return await sendReply(
                    "❌ **Update Failed**\nYou are hosted on Render, but the `DEPLOY_HOOK` environment variable is missing.\n\n" +
                    "To fix: Go to Render Settings -> Deploy Hooks -> Generate one, then add it to your Environment Variables."
                );
            }

            await sendReply("⚡ Triggering Render cloud build... Please wait a few minutes for the server to restart.");

            try {
                // Native fetch is available in Node 18+ (You are on v26)
                const response = await fetch(deployHook, { method: "POST" });
                
                if (response.ok) {
                    await sendReply("✅ Render deploy triggered successfully! Pikachu will go offline briefly and restart with the latest code.");
                } else {
                    await sendReply(`❌ Failed to trigger Render deploy. Status: ${response.status}`);
                }
            } catch (error) {
                console.error("Deploy hook error:", error);
                await sendReply(`❌ Error connecting to Render webhook:\n\`\`\`\n${error.message}\n\`\`\``);
            }
            return;
        }

        // -----------------------------------------
        // TERMUX / LOCAL VPS LOGIC
        // -----------------------------------------
        const updateCommand = "git checkout main 2>/dev/null || git checkout master 2>/dev/null; git pull origin HEAD";

        exec(updateCommand, async (error, stdout, stderr) => {
            if (error) {
                console.error("Git pull error:", error);
                return await sendReply(`❌ Update failed:\n\`\`\`\n${error.message}\n\`\`\``);
            }

            const output = stdout.trim() || stderr.trim();

            if (output.includes("Already up to date.") || output.includes("Already up-to-date.")) {
                return await sendReply("✅ Pikachu is already up to date.");
            }

            await sendReply(`✅ Update successful!\n\`\`\`\n${output}\n\`\`\`\nRestarting system...`);

            // Wait 1.5 seconds before restarting to allow message delivery
            setTimeout(() => {
                process.exit(1);
            }, 1500);
        });
    }
};
