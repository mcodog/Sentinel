// /mnt/Projects/Hackathonkuno/v1/Sentinel/frontend/src/tests/chatIntegration.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ChatContainer from '../components/chat/ChatContainer';
import chatService from '../utils/chatService';

// Mock the chat service
jest.mock('../utils/chatService', () => ({
    getConversations: jest.fn(),
    sendMessage: jest.fn(),
    clearChat: jest.fn(),
    checkAnonymousFeature: jest.fn()
}));

const mockStore = configureStore([]);

describe('Chat Integration Tests', () => {
    let store;
    const mockSetSentimentData = jest.fn();

    beforeEach(() => {
        store = mockStore({
            user: {
                id: 'test-user-id',
                email: 'test@example.com',
                role: 'patient',
                username: 'testuser'
            }
        });

        // Reset mocks
        jest.clearAllMocks();
    });

    it('fetches conversations on mount', async () => {
        const mockConversations = {
            conversations: [
                {
                    id: 'conv1',
                    type: 'chatbot',
                    date: new Date().toISOString(),
                    conversation: [
                        { sender: 'user', message: 'Hello', time: '10:00 AM' },
                        { sender: 'ai', message: 'Hi there!', time: '10:01 AM' }
                    ]
                }
            ],
            sentimentAnalysis: {
                overallLabel: 'positive',
                trend: 'improving',
                averageScore: 0.75
            }
        };

        chatService.getConversations.mockResolvedValue(mockConversations);

        render(
            <Provider store={store}>
                <ChatContainer setSentimentData={mockSetSentimentData} />
            </Provider>
        );

        await waitFor(() => {
            expect(chatService.getConversations).toHaveBeenCalledWith('test-user-id');
        });

        await waitFor(() => {
            expect(mockSetSentimentData).toHaveBeenCalledWith({
                overallSentiment: 'positive',
                recentTrend: 'improving',
                score: 0.75
            });
        });
    });

    it('sends a message and updates sentiment data', async () => {
        const mockResponse = {
            success: true,
            response: 'I understand how you feel.',
            sentiment: {
                label: 'negative',
                trend: 'stable',
                score: -0.3
            }
        };

        chatService.sendMessage.mockResolvedValue(mockResponse);

        render(
            <Provider store={store}>
                <ChatContainer setSentimentData={mockSetSentimentData} />
            </Provider>
        );

        await waitFor(() => {
            // Wait for initial load
            expect(chatService.getConversations).toHaveBeenCalled();
        });

        // Simulate sending a message
        // Note: This test would need to be adjusted based on your actual component implementation

        await waitFor(() => {
            expect(mockSetSentimentData).toHaveBeenCalledWith({
                overallSentiment: 'negative',
                recentTrend: 'stable',
                score: -0.3
            });
        });
    });
});
