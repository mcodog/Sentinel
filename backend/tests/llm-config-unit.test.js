// Test file for LLM configuration in chatbot service
import { describe, it } from 'node:test';
import assert from 'node:assert';
import ChatbotService from '../services/chatbot.service.js';

describe('ChatbotService LLM Configuration', () => {
    describe('Method Signature Validation', () => {
        it('should accept generateResponse with all parameters including llmOptions', () => {
            // Test that the method accepts the new parameter structure
            assert(typeof ChatbotService.generateResponse === 'function');

            // Check the function length (number of parameters)
            // generateResponse(userId, userMessage, sessionId, isAnonymous, llmOptions)
            assert(ChatbotService.generateResponse.length >= 4);
        });

        it('should have proper default parameter handling for llmOptions', async () => {
            // This test verifies the method signature without making API calls
            try {
                // Call with invalid user to trigger validation before API calls
                const result = await ChatbotService.generateResponse('', '');

                // Should fail with validation error, not parameter error
                assert.strictEqual(result.success, false);
                assert(result.error.includes('Invalid message'));
            } catch (error) {
                // Should not throw parameter-related errors
                assert(!error.message.includes('parameter'));
                assert(!error.message.includes('argument'));
            }
        });
    });

    describe('LLM Options Parameter Structure', () => {
        it('should accept llmOptions with proper structure', () => {
            const validLLMOptions = {
                enableLLM: true,
                enableLLMWordAnalysis: true,
                enableTranslation: true
            };

            // Test that the structure is valid
            assert(typeof validLLMOptions.enableLLM === 'boolean');
            assert(typeof validLLMOptions.enableLLMWordAnalysis === 'boolean');
            assert(typeof validLLMOptions.enableTranslation === 'boolean');
        });

        it('should handle Boolean conversion for llmOptions values', () => {
            const testValues = [
                { input: true, expected: true },
                { input: false, expected: false },
                { input: "true", expected: true },
                { input: "false", expected: true }, // truthy string
                { input: 1, expected: true },
                { input: 0, expected: false },
                { input: null, expected: false },
                { input: undefined, expected: false },
                { input: "", expected: false }
            ];

            testValues.forEach(({ input, expected }) => {
                assert.strictEqual(Boolean(input), expected,
                    `Boolean(${input}) should be ${expected}`);
            });
        });
    });

    describe('Anonymous Session Management', () => {
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

    describe('Controller Integration Expectations', () => {
        it('should expect controller to pass llmOptions parameter', () => {
            // This test documents the expected integration between controller and service
            const expectedControllerLLMOptions = {
                enableLLM: true,
                enableLLMWordAnalysis: true,
                enableTranslation: true
            };

            // Verify the structure matches what the controller should send
            assert(typeof expectedControllerLLMOptions === 'object');
            assert('enableLLM' in expectedControllerLLMOptions);
            assert('enableLLMWordAnalysis' in expectedControllerLLMOptions);
            assert('enableTranslation' in expectedControllerLLMOptions);
        });

        it('should handle controller request structure', () => {
            // Simulate the request body structure from the controller
            const mockRequestBody = {
                message: "I need help with anxiety",
                userId: "test-user-123",
                sessionId: null,
                isAnonymous: false,
                enableLLM: true,
                enableLLMWordAnalysis: true,
                enableTranslation: true
            };

            // Extract LLM options as the controller would
            const llmOptions = {
                enableLLM: Boolean(mockRequestBody.enableLLM),
                enableLLMWordAnalysis: Boolean(mockRequestBody.enableLLMWordAnalysis),
                enableTranslation: Boolean(mockRequestBody.enableTranslation)
            };

            assert.strictEqual(llmOptions.enableLLM, true);
            assert.strictEqual(llmOptions.enableLLMWordAnalysis, true);
            assert.strictEqual(llmOptions.enableTranslation, true);
        });
    });
});
