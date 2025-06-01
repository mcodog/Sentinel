# Chat Integration Guide

This document outlines the integration of the frontend chat interface with the backend chatbot API in the patient dashboard.

## Overview

The integration connects the frontend chat UI components with the backend chatbot API, enabling users to:
- Chat with the AI Assistant (chatbot)
- Create new chats
- Save conversation history
- Display sentiment analysis of chat conversations
- Distinguish between AI chat and doctor-patient conversations

## Components

### Main Components
- `ChatContainer.jsx` - Main container that orchestrates all chat functionality
- `ChatList.jsx` - Displays list of conversations
- `ChatMessages.jsx` - Displays messages in a conversation
- `ChatInput.jsx` - Handles user message input
- `ChatHeader.jsx` - Shows conversation header with AI Assistant info
- `NewChatButton.jsx` - Button to create new conversation

### Services
- `chatService.js` - Service for API interactions related to the chatbot

## Data Flow

1. User authentication is handled through Redux and stored in the user state
2. The ChatContainer fetches conversation history when mounted
3. When a user sends a message:
   - Message is displayed immediately in the UI
   - Message is sent to the backend API
   - Backend processes the message and performs sentiment analysis
   - Response is returned and displayed in the UI
   - Sentiment data is extracted and displayed in the dashboard

## Sentiment Analysis

The system analyzes user messages using sentiment analysis to:
- Determine overall emotional tone (positive, negative, neutral)
- Track emotional trends over time
- Assign a numerical sentiment score to each message

This data is visualized in the patient dashboard to help track emotional well-being over time.

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/chatbot/send` | POST | Send a message to the chatbot |
| `/chatbot/conversation/:userId` | GET | Get conversation history |
| `/chatbot/clear/:userId` | DELETE | Clear chat history |
| `/chatbot/anonymous-status` | GET | Check if anonymous chat is enabled |

## Authentication

All API requests include the authentication token in the Authorization header. The token is retrieved from local storage before each request.

## Future Improvements

- Real-time notifications for new messages
- Voice input for accessibility
- Enhanced sentiment visualization with charts
- Integration with emergency services for crisis detection
