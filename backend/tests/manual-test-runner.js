#!/usr/bin/env node

/**
 * Manual Test Runner for Chatbot Service
 * This file provides manual testing capabilities for the chatbot service
 * Run with: node tests/manual-test-runner.js
 */

import ChatbotService from '../services/chatbot.service.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestRunner {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            failures: []
        };
    }

    async assert(condition, message) {
        this.testResults.total++;
        if (condition) {
            this.testResults.passed++;
            console.log(`✅ PASS: ${message}`);
        } else {
            this.testResults.failed++;
            this.testResults.failures.push(message);
            console.log(`❌ FAIL: ${message}`);
        }
    }

    async assertEqual(actual, expected, message) {
        await this.assert(actual === expected, `${message} (expected: ${expected}, got: ${actual})`);
    }

    async assertIncludes(text, substring, message) {
        await this.assert(text.includes(substring), `${message} (text should include: "${substring}")`);
    }

    async runTest(testName, testFunction) {
        console.log(`\n🧪 Running: ${testName}`);
        try {
            await testFunction();
        } catch (error) {
            console.error(`💥 Error in ${testName}:`, error.message);
            this.testResults.failed++;
            this.testResults.failures.push(`${testName}: ${error.message}`);
        }
    }

    async runAllTests() {
        console.log('🚀 Starting Chatbot Service Tests\n');
        console.log('=' * 50);

        // Test Message Validation
        await this.runTest('Message Validation - Normal Message', async () => {
            const result = ChatbotService.validateMessage("I'm feeling anxious");
            await this.assertEqual(result.isValid, true, 'Should validate normal message');
            await this.assertEqual(result.containsRiskFactors, false, 'Should not detect risk factors');
        });

        await this.runTest('Message Validation - Crisis Message', async () => {
            const result = ChatbotService.validateMessage("I want to hurt myself");
            await this.assertEqual(result.isValid, true, 'Should still be valid for therapeutic response');
            await this.assertEqual(result.containsRiskFactors, true, 'Should detect risk factors');
            await this.assertEqual(result.needsImmediateAttention, true, 'Should need immediate attention');
        });

        // Test Crisis Response
        await this.runTest('Crisis Response Content', async () => {
            const response = ChatbotService.getCrisisResponse();
            await this.assertIncludes(response, '988', 'Should include suicide prevention lifeline');
            await this.assertIncludes(response, '741741', 'Should include crisis text line');
            await this.assertIncludes(response, 'emergency services', 'Should mention emergency services');
        });

        // Test Conversation Management
        await this.runTest('Conversation History - New User', async () => {
            const userId = 'test-user-' + Date.now();
            const result = ChatbotService.getConversationHistory(userId);
            await this.assertEqual(result.success, true, 'Should successfully get history');
            await this.assertEqual(result.messageCount, 0, 'New user should have empty history');
            await this.assert(Array.isArray(result.conversation), 'Conversation should be an array');
        });

        await this.runTest('Clear Conversation', async () => {
            const userId = 'test-user-' + Date.now();
            const result = ChatbotService.clearConversation(userId);
            await this.assertEqual(result.success, true, 'Should successfully clear conversation');
            await this.assertIncludes(result.message, 'cleared successfully', 'Should confirm clearing');
        });

        // Test Input Validation
        await this.runTest('Generate Response - Invalid Input', async () => {
            const userId = 'test-user-' + Date.now();

            // Test empty message
            const emptyResult = await ChatbotService.generateResponse(userId, '');
            await this.assertEqual(emptyResult.success, false, 'Should reject empty message');

            // Test null message
            const nullResult = await ChatbotService.generateResponse(userId, null);
            await this.assertEqual(nullResult.success, false, 'Should reject null message');

            // Test non-string message
            const numberResult = await ChatbotService.generateResponse(userId, 123);
            await this.assertEqual(numberResult.success, false, 'Should reject non-string message');
        });

        // Test API Response Structure (will likely fail due to API, but tests structure)
        await this.runTest('Generate Response - Structure Test', async () => {
            const userId = 'test-user-' + Date.now();
            const result = await ChatbotService.generateResponse(userId, 'Hello, I need help');

            await this.assert(typeof result === 'object', 'Should return an object');
            await this.assert(typeof result.success === 'boolean', 'Should have success boolean');
            await this.assert(typeof result.response === 'string', 'Should have response string');

            if (!result.success) {
                await this.assertIncludes(result.response, 'trouble processing', 'Should provide helpful error message');
            }
        });

        // Test Multiple Risk Patterns
        await this.runTest('Risk Pattern Detection', async () => {
            const riskMessages = [
                'I want to kill myself',
                'thinking about suicide',
                'want to end my life',
                'I want to hurt me',
                'self harm thoughts'
            ];

            for (const message of riskMessages) {
                const result = ChatbotService.validateMessage(message);
                await this.assertEqual(result.containsRiskFactors, true, `Should detect risk in: "${message}"`);
            }
        });

        // Test User Isolation
        await this.runTest('User Conversation Isolation', async () => {
            const user1 = 'user1-' + Date.now();
            const user2 = 'user2-' + Date.now();

            // Clear both users first
            ChatbotService.clearConversation(user1);
            ChatbotService.clearConversation(user2);

            // Generate responses for both users
            await ChatbotService.generateResponse(user1, 'Hello from user 1');
            await ChatbotService.generateResponse(user2, 'Hello from user 2');

            const history1 = ChatbotService.getConversationHistory(user1);
            const history2 = ChatbotService.getConversationHistory(user2);

            await this.assert(
                JSON.stringify(history1.conversation) !== JSON.stringify(history2.conversation),
                'Users should have separate conversation histories'
            );

            // Clean up
            ChatbotService.clearConversation(user1);
            ChatbotService.clearConversation(user2);
        });

        // Show Results
        this.showResults();
    }

    showResults() {
        console.log('\n' + '=' * 50);
        console.log('📊 TEST RESULTS');
        console.log('=' * 50);
        console.log(`Total Tests: ${this.testResults.total}`);
        console.log(`Passed: ${this.testResults.passed} ✅`);
        console.log(`Failed: ${this.testResults.failed} ❌`);
        console.log(`Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);

        if (this.testResults.failures.length > 0) {
            console.log('\n❌ FAILED TESTS:');
            this.testResults.failures.forEach((failure, index) => {
                console.log(`${index + 1}. ${failure}`);
            });
        }

        if (this.testResults.failed === 0) {
            console.log('\n🎉 All tests passed!');
        } else {
            console.log(`\n⚠️  ${this.testResults.failed} test(s) failed.`);
        }
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const runner = new TestRunner();
    runner.runAllTests().catch(error => {
        console.error('Fatal error running tests:', error);
        process.exit(1);
    });
}

export default TestRunner;
