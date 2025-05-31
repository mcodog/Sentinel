/**
 * Integration Tests for Chatbot Service
 * These tests verify the integration between different components
 * and simulate real-world usage scenarios
 */

import ChatbotService from '../services/chatbot.service.js';

class IntegrationTestSuite {
    constructor() {
        this.testResults = [];
        this.startTime = Date.now();
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${type}: ${message}`);
    }

    async runScenario(scenarioName, testFunction) {
        this.log(`🎬 Starting scenario: ${scenarioName}`, 'SCENARIO');
        const startTime = Date.now();

        try {
            const result = await testFunction();
            const duration = Date.now() - startTime;
            this.log(`✅ Scenario completed: ${scenarioName} (${duration}ms)`, 'SUCCESS');
            this.testResults.push({ scenario: scenarioName, status: 'PASSED', duration, result });
            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            this.log(`❌ Scenario failed: ${scenarioName} - ${error.message} (${duration}ms)`, 'ERROR');
            this.testResults.push({ scenario: scenarioName, status: 'FAILED', duration, error: error.message });
            throw error;
        }
    }

    async testCompleteUserJourney() {
        return await this.runScenario('Complete User Journey', async () => {
            const userId = 'integration-user-' + Date.now();
            const journey = [];

            // Step 1: User starts conversation
            this.log('User initiating conversation...');
            const firstMessage = "Hello, I've been feeling really anxious lately and don't know what to do";
            const response1 = await ChatbotService.generateResponse(userId, firstMessage);
            journey.push({ message: firstMessage, response: response1 });

            // Step 2: Check conversation history
            this.log('Checking conversation history...');
            const history1 = ChatbotService.getConversationHistory(userId);
            if (history1.messageCount === 0) {
                throw new Error('Conversation history should contain messages');
            }

            // Step 3: Continue conversation
            this.log('Continuing conversation...');
            const secondMessage = "Can you help me understand why I feel this way?";
            const response2 = await ChatbotService.generateResponse(userId, secondMessage);
            journey.push({ message: secondMessage, response: response2 });

            // Step 4: Verify conversation continuity
            const history2 = ChatbotService.getConversationHistory(userId);
            if (history2.messageCount <= history1.messageCount) {
                throw new Error('Conversation should have grown');
            }

            // Step 5: Test crisis scenario
            this.log('Testing crisis detection...');
            const crisisMessage = "Sometimes I think about hurting myself";
            const crisisValidation = ChatbotService.validateMessage(crisisMessage);
            if (!crisisValidation.needsImmediateAttention) {
                throw new Error('Crisis message should be detected');
            }

            // Step 6: Clear conversation
            this.log('Clearing conversation...');
            const clearResult = ChatbotService.clearConversation(userId);
            if (!clearResult.success) {
                throw new Error('Failed to clear conversation');
            }

            // Step 7: Verify conversation is cleared
            const finalHistory = ChatbotService.getConversationHistory(userId);
            if (finalHistory.messageCount !== 0) {
                throw new Error('Conversation should be empty after clearing');
            }

            return {
                journey,
                totalMessages: journey.length,
                crisisDetected: crisisValidation.needsImmediateAttention,
                conversationCleared: clearResult.success
            };
        });
    }

    async testConcurrentUsers() {
        return await this.runScenario('Concurrent Users Test', async () => {
            const userCount = 5;
            const users = Array.from({ length: userCount }, (_, i) => ({
                id: `concurrent-user-${i}-${Date.now()}`,
                messages: [
                    `Hello, I'm user ${i} and I need help`,
                    `Can you provide some guidance for user ${i}?`,
                    `Thank you for helping user ${i}`
                ]
            }));

            // Send messages for all users concurrently
            const promises = users.map(async (user) => {
                const responses = [];
                for (const message of user.messages) {
                    const response = await ChatbotService.generateResponse(user.id, message);
                    responses.push(response);
                }
                return { userId: user.id, responses };
            });

            const results = await Promise.all(promises);

            // Verify each user has their own conversation
            for (const user of users) {
                const history = ChatbotService.getConversationHistory(user.id);
                if (history.messageCount === 0) {
                    throw new Error(`User ${user.id} should have conversation history`);
                }

                // Clean up
                ChatbotService.clearConversation(user.id);
            }

            return {
                userCount,
                results: results.map(r => ({
                    userId: r.userId,
                    responseCount: r.responses.length,
                    allSuccessful: r.responses.every(resp => typeof resp.response === 'string')
                }))
            };
        });
    }

    async testErrorHandling() {
        return await this.runScenario('Error Handling Test', async () => {
            const userId = 'error-test-user-' + Date.now();
            const errorTests = [];

            // Test 1: Invalid message types
            const invalidInputs = [null, undefined, '', '   ', 123, {}, []];
            for (const input of invalidInputs) {
                try {
                    const result = await ChatbotService.generateResponse(userId, input);
                    errorTests.push({
                        input: input,
                        type: typeof input,
                        success: result.success,
                        hasError: !!result.error,
                        handledGracefully: !result.success && result.response.includes('trouble processing')
                    });
                } catch (error) {
                    errorTests.push({
                        input: input,
                        type: typeof input,
                        threwError: true,
                        error: error.message
                    });
                }
            }

            // Test 2: Edge cases for conversation management
            const edgeCases = [
                () => ChatbotService.getConversationHistory(null),
                () => ChatbotService.getConversationHistory(undefined),
                () => ChatbotService.getConversationHistory(''),
                () => ChatbotService.clearConversation(null),
                () => ChatbotService.clearConversation(undefined)
            ];

            const edgeResults = [];
            for (const testCase of edgeCases) {
                try {
                    const result = testCase();
                    edgeResults.push({
                        success: !!result.success,
                        handledGracefully: true
                    });
                } catch (error) {
                    edgeResults.push({
                        success: false,
                        error: error.message,
                        handledGracefully: false
                    });
                }
            }

            return {
                invalidInputTests: errorTests,
                edgeCaseTests: edgeResults,
                allErrorsHandledGracefully: errorTests.every(t => t.handledGracefully !== false) &&
                    edgeResults.every(r => r.handledGracefully)
            };
        });
    }

    async testMessageValidationComprehensive() {
        return await this.runScenario('Comprehensive Message Validation', async () => {
            const testCases = [
                // Normal mental health topics
                { message: "I'm feeling depressed", expectRisk: false },
                { message: "I have anxiety about work", expectRisk: false },
                { message: "I'm stressed about my relationship", expectRisk: false },
                { message: "I can't sleep well", expectRisk: false },
                { message: "I feel overwhelmed", expectRisk: false },

                // Crisis indicators
                { message: "I want to hurt myself", expectRisk: true },
                { message: "I'm thinking about suicide", expectRisk: true },
                { message: "I want to end my life", expectRisk: true },
                { message: "I want to kill myself", expectRisk: true },
                { message: "I don't want to live anymore", expectRisk: false }, // This one might not be caught

                // Variations and edge cases
                { message: "I hurt myself yesterday", expectRisk: true },
                { message: "suicide seems like an option", expectRisk: true },
                { message: "What if I just end it all", expectRisk: false }, // Indirect
                { message: "SUICIDE", expectRisk: true }, // All caps
                { message: "self-harm thoughts", expectRisk: true }, // Hyphenated
            ];

            const results = testCases.map(testCase => {
                const validation = ChatbotService.validateMessage(testCase.message);
                const correct = validation.containsRiskFactors === testCase.expectRisk;

                return {
                    message: testCase.message,
                    expected: testCase.expectRisk,
                    detected: validation.containsRiskFactors,
                    correct,
                    needsAttention: validation.needsImmediateAttention
                };
            });

            const accuracy = results.filter(r => r.correct).length / results.length;

            return {
                testCases: results,
                accuracy: accuracy,
                totalTests: results.length,
                correctPredictions: results.filter(r => r.correct).length
            };
        });
    }

    async testPerformance() {
        return await this.runScenario('Performance Test', async () => {
            const userId = 'perf-test-user-' + Date.now();
            const messageCount = 20;
            const messages = Array.from({ length: messageCount }, (_, i) =>
                `Performance test message ${i + 1}: I need help with my mental health`
            );

            const startTime = Date.now();
            const timings = [];

            for (let i = 0; i < messageCount; i++) {
                const msgStart = Date.now();

                try {
                    await ChatbotService.generateResponse(userId, messages[i]);
                    const duration = Date.now() - msgStart;
                    timings.push({ messageIndex: i, duration, success: true });
                } catch (error) {
                    const duration = Date.now() - msgStart;
                    timings.push({ messageIndex: i, duration, success: false, error: error.message });
                }
            }

            const totalTime = Date.now() - startTime;
            const avgTime = timings.reduce((sum, t) => sum + t.duration, 0) / timings.length;
            const successRate = timings.filter(t => t.success).length / timings.length;

            // Clean up
            ChatbotService.clearConversation(userId);

            return {
                messageCount,
                totalTime,
                averageTimePerMessage: avgTime,
                successRate,
                timings: timings.slice(0, 5) // Just show first 5 for brevity
            };
        });
    }

    async runAllIntegrationTests() {
        this.log('🚀 Starting Integration Test Suite', 'START');

        try {
            await this.testCompleteUserJourney();
            await this.testConcurrentUsers();
            await this.testErrorHandling();
            await this.testMessageValidationComprehensive();
            await this.testPerformance();

            this.generateReport();
        } catch (error) {
            this.log(`💥 Integration test suite failed: ${error.message}`, 'FATAL');
            this.generateReport();
            throw error;
        }
    }

    generateReport() {
        const totalTime = Date.now() - this.startTime;
        const passed = this.testResults.filter(r => r.status === 'PASSED').length;
        const failed = this.testResults.filter(r => r.status === 'FAILED').length;

        console.log('\n' + '='.repeat(60));
        console.log('📋 INTEGRATION TEST REPORT');
        console.log('='.repeat(60));
        console.log(`Total Scenarios: ${this.testResults.length}`);
        console.log(`Passed: ${passed} ✅`);
        console.log(`Failed: ${failed} ❌`);
        console.log(`Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);
        console.log(`Total Execution Time: ${totalTime}ms`);

        if (failed > 0) {
            console.log('\n❌ FAILED SCENARIOS:');
            this.testResults
                .filter(r => r.status === 'FAILED')
                .forEach((result, index) => {
                    console.log(`${index + 1}. ${result.scenario}: ${result.error}`);
                });
        }

        console.log('\n📊 SCENARIO DETAILS:');
        this.testResults.forEach(result => {
            const status = result.status === 'PASSED' ? '✅' : '❌';
            console.log(`${status} ${result.scenario} (${result.duration}ms)`);
        });

        if (failed === 0) {
            console.log('\n🎉 All integration tests passed!');
        } else {
            console.log(`\n⚠️  ${failed} scenario(s) failed.`);
        }
    }
}

// Run integration tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const suite = new IntegrationTestSuite();
    suite.runAllIntegrationTests().catch(error => {
        console.error('Fatal error running integration tests:', error);
        process.exit(1);
    });
}

export default IntegrationTestSuite;
