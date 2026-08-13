module.exports = {
    command: "id",
    description: "Get the current chat ID",
    isOwner: false,
    
    execute: async (client, message, args) => {
        try {
            const currentChatId = message.chatId ? message.chatId.toString() : "Unknown";
            const responseText = `Chat ID: ${currentChatId}`;
            
            if (message.out) {
                // Edit the message if it was sent by the owner
                await message.edit({
                    text: responseText
                });
            } else {
                // Send a new message if it was triggered by another user
                await client.sendMessage(message.chatId, {
                    message: responseText
                });
            }
        } catch (error) {
            console.error("Error in ID plugin:", error);
        }
    }
};
