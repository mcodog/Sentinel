import { supabaseAdmin } from '../services/supabase.service.js';
import ChatbotService from '../services/chatbot.service.js';

/**
 * Test script to validate database alignment with organization structure
 * Run this after migration to ensure everything works correctly
 */

async function testDatabaseAlignment() {
    console.log('🧪 Testing Database Alignment with Organization Structure\n');

    try {
        // Test 1: Verify existing tables exist
        console.log('1. Checking existing table structure...');

        const { data: users, error: usersError } = await supabaseAdmin
            .from('users')
            .select('id')
            .limit(1);

        if (usersError) {
            console.error('❌ Users table check failed:', usersError.message);
            return false;
        }
        console.log('✅ Users table exists');

        const { data: sessions, error: sessionsError } = await supabaseAdmin
            .from('sessions')
            .select('id, type')
            .limit(1);

        if (sessionsError) {
            console.error('❌ Sessions table check failed:', sessionsError.message);
            return false;
        }
        console.log('✅ Sessions table exists');

        const { data: messages, error: messagesError } = await supabaseAdmin
            .from('message')
            .select('id, session_id, from_user')
            .limit(1);

        if (messagesError) {
            console.error('❌ Message table check failed:', messagesError.message);
            return false;
        }
        console.log('✅ Message table exists');

        // Test 2: Check sentiment_analysis table
        console.log('\n2. Checking sentiment_analysis table...');

        const { data: sentiment, error: sentimentError } = await supabaseAdmin
            .from('sentiment_analysis')
            .select('id, message_id')
            .limit(1);

        if (sentimentError) {
            console.error('❌ Sentiment analysis table check failed:', sentimentError.message);
            console.log('💡 Make sure to run: psql "$DATABASE_URL" -f migrations/create_sentiment_analysis_table.sql');
            return false;
        }
        console.log('✅ Sentiment analysis table exists');

        // Test 3: Test chatbot service methods
        console.log('\n3. Testing ChatbotService methods...');

        // Test session creation (requires actual user ID)
        console.log('📝 Session creation test requires actual user ID from your database');
        console.log('📝 Message saving test requires actual session ID');
        console.log('📝 Run manual tests with real user data for full validation');

        console.log('\n✅ Database structure alignment successful!');
        console.log('\n📋 Next steps:');
        console.log('   1. Test with real user authentication');
        console.log('   2. Send test messages through the chat interface');
        console.log('   3. Verify sentiment analysis data is saved');
        console.log('   4. Check conversation history retrieval');

        return true;

    } catch (error) {
        console.error('❌ Database alignment test failed:', error);
        return false;
    }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testDatabaseAlignment()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('Test execution failed:', error);
            process.exit(1);
        });
}

export default testDatabaseAlignment;
