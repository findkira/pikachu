module.exports = {
    command: "id",
    description: "Get the current chat ID",
    
    execute: async (client, message, args) => {
        await client.editMessage(message.chatId, {
            message: message.id,
            text: `Chat ID: ${message.chatId}`
        });
    }
};
