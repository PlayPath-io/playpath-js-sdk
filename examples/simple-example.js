/**
 * PlayPath SDK - Simple Usage Example
 * 
 * This example shows the most basic usage of the PlayPath SDK
 * Run with: node simple-example.js
 */

const { PlayPathSDK } = require('../playpath-sdk.js');

async function main() {
    // Initialize the SDK
    const sdk = new PlayPathSDK({
        baseUrl: 'http://localhost:3000', // Replace with your PlayPath instance
        apiKey: 'your-api-key-here'       // Replace with your API key
    });

    console.log('🏉 PlayPath SDK - Simple Example');
    console.log('================================\n');

    try {
        // Example 1: Simple chat message
        console.log('1️⃣ Simple chat message:');
        const response1 = await sdk.ragChat({
            message: "What's the best way to improve tackling technique?"
        });
        console.log('Answer:', response1.reply);
        console.log('');

        // Example 2: Chat with custom system prompt
        console.log('2️⃣ Chat with custom system prompt:');
        const response2 = await sdk.ragChat({
            message: "Explain defensive strategies",
            system_prompt: "You are a rugby defense specialist coach. Focus on team defensive patterns."
        });
        console.log('Answer:', response2.reply);
        console.log('');

        // Example 3: Chat session with history
        console.log('3️⃣ Chat session with automatic history:');
        const chatSession = sdk.createChatSession();
        
        const msg1 = await chatSession.sendMessage("What are the key scrum positions?");
        console.log('Q: What are the key scrum positions?');
        console.log('A:', msg1.reply);
        
        const msg2 = await chatSession.sendMessage("Which position is most important?");
        console.log('\nQ: Which position is most important?');
        console.log('A:', msg2.reply);
        
        console.log('\nChat history:', chatSession.getHistory().length, 'messages');
        console.log('');

        // Example 4: Knowledge base management
        console.log('4️⃣ Knowledge base operations:');
        
        // Get all items
        const items = await sdk.getItems();
        console.log(`Found ${items.length} items in knowledge base`);
        
        // Create a new item
        const newItem = await sdk.createItem({
            title: "SDK Test Item",
            text: "This is a test item created by the PlayPath SDK",
            tags: ["sdk", "test", "demo"]
        });
        console.log(`Created new item with ID: ${newItem.id}`);
        
        // Get the item details
        const itemDetails = await sdk.getItem(newItem.id);
        console.log(`Retrieved item: ${itemDetails.title}`);
        
        // Clean up - delete the test item
        await sdk.deleteItem(newItem.id);
        console.log('Test item deleted');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.status) {
            console.error('Status:', error.status);
        }
    }

    console.log('\n✅ Example completed!');
}

// Run the example
if (require.main === module) {
    main().catch(console.error);
}

module.exports = main;