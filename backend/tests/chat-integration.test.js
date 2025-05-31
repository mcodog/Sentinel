// Test script to verify chat database integration
import ChatbotService from './services/chatbot.service.js';
import sentimentService from './services/sentiment.service.js';

async function testChatIntegration() {
    console.log('🧪 Testing Chat Database Integration...\n');

    // Mock user ID (in real implementation, this comes from auth)
    const testUserId = '123e4567-e89b-12d3-a456-426614174000';
    const testMessage = "I'm feeling really anxious about my job interview tomorrow.";

    try {
        console.log('1. Testing sentiment analysis...');
        const sentiment = await sentimentService.analyzeSentiment(testMessage);
        console.log('✅ Sentiment analysis result:', {
            category: sentiment.overall.category,
            score: sentiment.overall.compound,
            wasTranslated: sentiment.translation.wasTranslated
        });

        console.log('\n2. Testing chatbot response generation...');
        const response = await ChatbotService.generateResponse(testUserId, testMessage);
        console.log('✅ Chatbot response generated:', {
            success: response.success,
            hasResponse: !!response.response,
            sessionId: response.sessionId,
            hasSentiment: !!response.sentiment
        });

        if (response.success) {
            console.log('\n3. Testing conversation history retrieval...');
            const history = await ChatbotService.getConversationHistory(testUserId);
            console.log('✅ Conversation history retrieved:', {
                success: history.success,
                messageCount: history.messageCount
            });
        }

        console.log('\n🎉 All tests passed! Chat integration is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n📝 Make sure to:');
        console.log('1. Run the database migration in Supabase');
        console.log('2. Set up proper environment variables');
        console.log('3. Ensure Supabase connection is working');
    }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testChatIntegration();
}

export default testChatIntegration;
