module.exports = {
    command: "id",
    description: "Get the current chat ID",
    
    execute: async (client, message, args) => {
        try {
            // Convert the BigInt object to a readable string
            const currentChatId = message.chatId ? message.chatId.toString() : "Unknown";
            
            // Use the direct edit method available on the message object
            await message.edit({
                text: `Chat ID: ${currentChatId}`
            });
        } catch (error) {
            console.error("Error in ID plugin:", error);
        }
    }
};
