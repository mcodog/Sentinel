// Test file for LLM configuration in chatbot service
import { describe, it } from 'node:test';
import assert from 'node:assert';
import ChatbotService from '../services/chatbot.service.js';

describe('ChatbotService LLM Configuration', () => {
    const testUserId = 'test-llm-user-' + Date.now();
    const testMessage = 'I am feeling anxious and worried about my future';

    describe('generateResponse with LLM Options', () => {
        it('should accept default LLM configuration', async () => {
            // Test with anonymous mode to avoid database foreign key issues
            const result = await ChatbotService.generateResponse(
                null,
                testMessage,
                null,
                true // isAnonymous = true
            );

            assert.strictEqual(result.success, true);
            assert(typeof result.response === 'string');
            assert(result.sentiment !== null);
            assert.strictEqual(result.isAnonymous, true);
        });

        it('should accept custom LLM configuration with all features enabled', async () => {
            const llmOptions = {
                enableLLM: true,
                enableLLMWordAnalysis: true,
                enableTranslation: true
            };

            // Test with anonymous mode to avoid database foreign key issues
            const result = await ChatbotService.generateResponse(
                null,
                testMessage,
                null,
                true, // isAnonymous = true
                llmOptions
            );

            assert.strictEqual(result.success, true);
            assert(typeof result.response === 'string');
            assert(result.sentiment !== null);
            assert.strictEqual(result.isAnonymous, true);
        });

        it('should accept custom LLM configuration with LLM disabled', async () => {
            const llmOptions = {
                enableLLM: false,
                enableLLMWordAnalysis: false,
                enableTranslation: false
            };

            // Test with anonymous mode to avoid database foreign key issues
            const result = await ChatbotService.generateResponse(
                null,
                testMessage,
                null,
                true, // isAnonymous = true
                llmOptions
            );

            assert.strictEqual(result.success, true);
            assert(typeof result.response === 'string');
            // Sentiment should still be available (basic sentiment analysis)
            assert(result.sentiment !== null);
            assert.strictEqual(result.isAnonymous, true);
        });

        it('should accept custom LLM configuration with selective features', async () => {
            const llmOptions = {
                enableLLM: true,
                enableLLMWordAnalysis: false,
                enableTranslation: true
            };

            // Test with anonymous mode to avoid database foreign key issues
            const result = await ChatbotService.generateResponse(
                null,
                testMessage,
                null,
                true, // isAnonymous = true
                llmOptions
            );

            assert.strictEqual(result.success, true);
            assert(typeof result.response === 'string');
            assert(result.sentiment !== null);
            assert.strictEqual(result.isAnonymous, true);
        });

        it('should handle invalid LLM configuration gracefully', async () => {
            const llmOptions = {
                enableLLM: "invalid",
                enableLLMWordAnalysis: null,
                enableTranslation: undefined
            };

            // Test with anonymous mode to avoid database foreign key issues
            const result = await ChatbotService.generateResponse(
                null,
                testMessage,
                null,
                true, // isAnonymous = true
                llmOptions
            );

            // Should still work as Boolean conversion handles invalid values
            assert.strictEqual(result.success, true);
            assert(typeof result.response === 'string');
            assert.strictEqual(result.isAnonymous, true);
        });

        it('should maintain backward compatibility with no LLM options provided', async () => {
            // Test calling without the llmOptions parameter
            const result = await ChatbotService.generateResponse(
                null,
                testMessage,
                null,
                true // isAnonymous = true
                // No llmOptions parameter - should use defaults
            );

            assert.strictEqual(result.success, true);
            assert(typeof result.response === 'string');
            assert(result.sentiment !== null);
            assert.strictEqual(result.isAnonymous, true);
        });
    });

    describe('Anonymous Session Management with LLM', () => {
        it('should generate unique session IDs for different anonymous users', () => {
            const sessionId1 = ChatbotService.generateAnonymousSessionId();
            const sessionId2 = ChatbotService.generateAnonymousSessionId();

            assert(typeof sessionId1 === 'string');
            assert(typeof sessionId2 === 'string');
            assert(sessionId1 !== sessionId2);
            assert(sessionId1.startsWith('anon_'));
            assert(sessionId2.startsWith('anon_'));
        });

        it('should check anonymous chat status', () => {
            const isEnabled = ChatbotService.isAnonymousChatEnabled();
            assert(typeof isEnabled === 'boolean');
        });
    });
});
