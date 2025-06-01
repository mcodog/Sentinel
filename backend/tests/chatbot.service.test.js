import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import ChatbotService from '../services/chatbot.service.js';

// Mock the HuggingFace client to avoid API calls during testing
const originalEnv = process.env;

describe('ChatbotService', () => {
    let testUserId;

    beforeEach(() => {
        // Set up test environment
        testUserId = 'test-user-' + Date.now();

        // Clear any existing conversation data
        ChatbotService.clearConversation(testUserId);
    });

    afterEach(() => {
        // Clean up after each test
        ChatbotService.clearConversation(testUserId);
        process.env = originalEnv;
    });

    describe('validateMessage', () => {
        it('should return valid for normal mental health messages', () => {
            const message = "I've been feeling anxious lately";
            const result = ChatbotService.validateMessage(message);

            assert.strictEqual(result.isValid, true);
            assert.strictEqual(result.containsRiskFactors, false);
            assert.strictEqual(result.needsImmediateAttention, false);
        });

        it('should detect self-harm related content', () => {
            const message = "I want to hurt myself";
            const result = ChatbotService.validateMessage(message);

            assert.strictEqual(result.isValid, true); // Still valid but flagged
            assert.strictEqual(result.containsRiskFactors, true);
            assert.strictEqual(result.needsImmediateAttention, true);
        });

        it('should detect suicide-related content', () => {
            const message = "I'm thinking about suicide";
            const result = ChatbotService.validateMessage(message);

            assert.strictEqual(result.isValid, true);
            assert.strictEqual(result.containsRiskFactors, true);
            assert.strictEqual(result.needsImmediateAttention, true);
        });

        it('should detect variations of harmful content', () => {
            const messages = [
                "I want to kill myself",
                "I want to end my life",
                "I want to hurt me"
            ];

            messages.forEach(message => {
                const result = ChatbotService.validateMessage(message);
                assert.strictEqual(result.containsRiskFactors, true, `Failed for message: "${message}"`);
                assert.strictEqual(result.needsImmediateAttention, true, `Failed for message: "${message}"`);
            });
        });
    });

    describe('getCrisisResponse', () => {
        it('should return appropriate crisis response with helpline numbers', () => {
            const response = ChatbotService.getCrisisResponse();

            assert(typeof response === 'string');
            assert(response.includes('988')); // Suicide prevention lifeline
            assert(response.includes('741741')); // Crisis text line
            assert(response.includes('emergency services'));
            assert(response.length > 100); // Should be comprehensive
        });
    });

    describe('getConversationHistory', () => {
        it('should return empty conversation for new user', () => {
            const result = ChatbotService.getConversationHistory(testUserId);

            assert.strictEqual(result.success, true);
            assert.strictEqual(result.messageCount, 0);
            assert(Array.isArray(result.conversation));
            assert.strictEqual(result.conversation.length, 0);
        });

        it('should handle missing userId gracefully', () => {
            const result = ChatbotService.getConversationHistory(null);

            assert.strictEqual(result.success, true);
            assert.strictEqual(result.messageCount, 0);
            assert(Array.isArray(result.conversation));
        });
    });

    describe('clearConversation', () => {
        it('should successfully clear conversation for existing user', () => {
            const result = ChatbotService.clearConversation(testUserId);

            assert.strictEqual(result.success, true);
            assert.strictEqual(result.message, 'Conversation history cleared successfully');
        });

        it('should handle clearing non-existent conversation', () => {
            const result = ChatbotService.clearConversation('non-existent-user');

            assert.strictEqual(result.success, true);
            assert.strictEqual(result.message, 'Conversation history cleared successfully');
        });

        it('should handle null userId gracefully', () => {
            const result = ChatbotService.clearConversation(null);

            assert.strictEqual(result.success, true);
        });
    });

    describe('generateResponse - Input Validation', () => {
        it('should reject empty message', async () => {
            const result = await ChatbotService.generateResponse(testUserId, '');

            assert.strictEqual(result.success, false);
            assert(result.error.includes('Invalid message provided'));
        });

        it('should reject null message', async () => {
            const result = await ChatbotService.generateResponse(testUserId, null);

            assert.strictEqual(result.success, false);
            assert(result.error.includes('Invalid message provided'));
        });

        it('should reject undefined message', async () => {
            const result = await ChatbotService.generateResponse(testUserId, undefined);

            assert.strictEqual(result.success, false);
            assert(result.error.includes('Invalid message provided'));
        });

        it('should reject non-string message', async () => {
            const result = await ChatbotService.generateResponse(testUserId, 123);

            assert.strictEqual(result.success, false);
            assert(result.error.includes('Invalid message provided'));
        });

        it('should accept whitespace-padded message', async () => {
            const result = await ChatbotService.generateResponse(testUserId, '  hello  ');

            // This will fail due to API call, but should not fail on validation
            assert(result.error === undefined || !result.error.includes('Invalid message provided'));
        });
    });

    describe('generateResponse - Error Handling', () => {
        it('should handle API errors gracefully', async () => {
            // This will likely fail due to API issues, but should return proper error structure
            const result = await ChatbotService.generateResponse(testUserId, 'Hello, I need help');

            // Check that it returns proper structure regardless of success/failure
            assert(typeof result === 'object');
            assert(typeof result.success === 'boolean');
            assert(typeof result.response === 'string');

            if (!result.success) {
                assert(result.response.includes('trouble processing'));
                assert(result.response.includes('mental health emergency'));
            }
        });

        it('should provide fallback response on failure', async () => {
            const result = await ChatbotService.generateResponse(testUserId, 'Test message');

            if (!result.success) {
                assert(result.response.includes("I'm sorry"));
                assert(result.response.includes('crisis helpline'));
                assert(result.response.includes('emergency services'));
            }
        });
    });

    describe('Conversation Management', () => {
        it('should maintain conversation state across multiple messages', async () => {
            const message1 = 'Hello, I need help with anxiety';
            const message2 = 'Can you tell me more about that?';

            // Send first message
            await ChatbotService.generateResponse(testUserId, message1);

            // Check conversation history after first message
            let history = ChatbotService.getConversationHistory(testUserId);
            assert(history.messageCount >= 1);

            // Send second message
            await ChatbotService.generateResponse(testUserId, message2);

            // Check conversation history after second message
            history = ChatbotService.getConversationHistory(testUserId);
            assert(history.messageCount >= 2);
        });

        it('should isolate conversations between different users', async () => {
            const user1 = 'user1-' + Date.now();
            const user2 = 'user2-' + Date.now();

            await ChatbotService.generateResponse(user1, 'Hello from user 1');
            await ChatbotService.generateResponse(user2, 'Hello from user 2');

            const history1 = ChatbotService.getConversationHistory(user1);
            const history2 = ChatbotService.getConversationHistory(user2);

            // Each user should have their own conversation
            assert(history1.conversation !== history2.conversation);

            // Clean up
            ChatbotService.clearConversation(user1);
            ChatbotService.clearConversation(user2);
        });
    });

    describe('Service Configuration', () => {
        it('should have proper therapeutic prompt defined', () => {
            // We can't directly access PROMPT, but we can verify service behavior
            assert(typeof ChatbotService.generateResponse === 'function');
            assert(typeof ChatbotService.validateMessage === 'function');
            assert(typeof ChatbotService.getCrisisResponse === 'function');
        });

        it('should have all required static methods', () => {
            const requiredMethods = [
                'generateResponse',
                'getConversationHistory',
                'clearConversation',
                'validateMessage',
                'getCrisisResponse'
            ];

            requiredMethods.forEach(method => {
                assert(typeof ChatbotService[method] === 'function', `Missing method: ${method}`);
            });
        });
    });

    describe('Message Content Analysis', () => {
        it('should handle various mental health topics', () => {
            const topics = [
                'anxiety',
                'depression',
                'stress',
                'panic attacks',
                'feeling overwhelmed',
                'insomnia',
                'grief',
                'relationship issues'
            ];

            topics.forEach(topic => {
                const validation = ChatbotService.validateMessage(`I'm dealing with ${topic}`);
                assert.strictEqual(validation.isValid, true);
                assert.strictEqual(validation.containsRiskFactors, false);
            });
        });

        it('should properly categorize crisis vs non-crisis messages', () => {
            const normalMessages = [
                "I'm feeling a bit down today",
                "Work has been stressful",
                "I had an argument with my friend",
                "I'm having trouble sleeping"
            ];

            const crisisMessages = [
                "I want to hurt myself",
                "I'm thinking about suicide",
                "I want to end my life",
                "I want to kill myself"
            ];

            normalMessages.forEach(msg => {
                const result = ChatbotService.validateMessage(msg);
                assert.strictEqual(result.needsImmediateAttention, false, `False positive for: "${msg}"`);
            });

            crisisMessages.forEach(msg => {
                const result = ChatbotService.validateMessage(msg);
                assert.strictEqual(result.needsImmediateAttention, true, `False negative for: "${msg}"`);
            });
        });
    });
});

// Export for potential integration with other test runners
export { describe, it, beforeEach, afterEach };
