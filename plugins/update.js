const { exec } = require("child_process");

module.exports = {
    command: "update",
    description: "Pull latest changes from GitHub and restart",
    isOwner: true,

    execute: async (client, message, args) => {
        const isFromMe = message.out;

        const sendReply = async (text) => {
            if (isFromMe) {
                await message.edit({ text });
            } else {
                await client.sendMessage(message.chatId, { message: text });
            }
        };

        await sendReply("⚡ Checking for updates from GitHub...");

        // Execute git pull in the background shell
        exec("git pull", async (error, stdout, stderr) => {
            if (error) {
                console.error("Git pull error:", error);
                return await sendReply(`❌ Update failed:\n\`\`\`\n${error.message}\n\`\`\``);
            }

            // Check if there were any new commits
            if (stdout.includes("Already up to date.") || stdout.includes("Already up-to-date.")) {
                return await sendReply("✅ Pikachu is already up to date.");
            }

            await sendReply(`✅ Update successful!\n\`\`\`\n${stdout.trim()}\n\`\`\`\nRestarting system...`);

            // Wait 1.5 seconds for the message to send before restarting
            setTimeout(() => {
                process.exit(1);
            }, 1500);
        });
    }
};
