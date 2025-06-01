// Mock data generator for sentiment analysis
export const generateMockSentimentData = () => {
    const users = [
        { id: 1, name: 'john_doe', displayName: 'John Doe' },
        { id: 2, name: 'jane_smith', displayName: 'Jane Smith' },
        { id: 3, name: 'mike_johnson', displayName: 'Mike Johnson' },
        { id: 4, name: 'sarah_wilson', displayName: 'Sarah Wilson' },
        { id: 5, name: 'david_brown', displayName: 'David Brown' },
        { id: 6, name: 'emily_davis', displayName: 'Emily Davis' },
        { id: 7, name: 'chris_miller', displayName: 'Chris Miller' },
        { id: 8, name: 'lisa_garcia', displayName: 'Lisa Garcia' }
    ];

    const concerns = ['anxiety', 'depression', 'stress', 'sleep', 'relationships', 'work', 'family', 'health'];
    const emotionalThemes = ['worried', 'hopeful', 'frustrated', 'calm', 'overwhelmed', 'optimistic', 'sad', 'content'];

    const generateTimelineData = (days = 7) => {
        const timeline = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            timeline.push({
                date: date.toISOString().split('T')[0],
                positive: Math.floor(Math.random() * 40) + 30, // 30-70
                neutral: Math.floor(Math.random() * 30) + 20,  // 20-50
                negative: Math.floor(Math.random() * 20) + 5,  // 5-25
                compound: (Math.random() - 0.5) * 1.5 // -0.75 to 0.75
            });
        }
        return timeline;
    };

    const generateUserSentiment = (userId) => {
        const baseCompound = (Math.random() - 0.5) * 1.5; // -0.75 to 0.75
        const positive = Math.max(10, Math.min(80, 50 + baseCompound * 30));
        const negative = Math.max(5, Math.min(40, 20 - baseCompound * 20));
        const neutral = 100 - positive - negative;

        const riskLevel = baseCompound < -0.4 ? 'High' : baseCompound < -0.1 ? 'Medium' : 'Low';
        const trend = Math.random() > 0.5 ? 'improving' : Math.random() > 0.5 ? 'stable' : 'declining';

        return {
            userId,
            analysis: {
                compound: Number(baseCompound.toFixed(4)),
                positive: Number(positive.toFixed(1)),
                negative: Number(negative.toFixed(1)),
                neutral: Number(neutral.toFixed(1))
            },
            timeline: generateTimelineData(),
            riskAssessment: {
                level: riskLevel,
                score: Math.abs(baseCompound),
                trend: trend,
                factors: concerns.slice(0, Math.floor(Math.random() * 4) + 1),
                lastUpdated: new Date().toISOString()
            },
            emotionalThemes: {
                primary: emotionalThemes[Math.floor(Math.random() * emotionalThemes.length)],
                secondary: emotionalThemes.filter(theme => theme !== emotionalThemes[0]).slice(0, 2),
                intensity: Math.random() * 0.8 + 0.2 // 0.2 to 1.0
            },
            insights: {
                dominantConcerns: concerns.slice(0, Math.floor(Math.random() * 3) + 1),
                recommendedActions: [
                    'Continue monitoring daily mood patterns',
                    'Consider stress management techniques',
                    'Schedule follow-up session within 1 week'
                ].slice(0, Math.floor(Math.random() * 3) + 1),
                sessionCount: Math.floor(Math.random() * 20) + 5,
                avgSessionLength: Math.floor(Math.random() * 30) + 15,
                engagementScore: Math.random() * 0.5 + 0.5
            },
            wordAnalysis: {
                totalWords: Math.floor(Math.random() * 1000) + 500,
                uniqueWords: Math.floor(Math.random() * 200) + 100,
                sentimentWords: {
                    positive: ['hopeful', 'better', 'good', 'happy', 'calm'].slice(0, Math.floor(Math.random() * 3) + 1),
                    negative: ['worried', 'anxious', 'stressed', 'sad', 'overwhelmed'].slice(0, Math.floor(Math.random() * 3) + 1),
                    neutral: ['maybe', 'sometimes', 'usual', 'normal'].slice(0, Math.floor(Math.random() * 2) + 1)
                }
            },
            metadata: {
                lastAnalyzed: new Date().toISOString(),
                dataPoints: Math.floor(Math.random() * 50) + 20,
                confidence: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
                version: '1.0.0'
            }
        };
    };

    // Generate sentiment data for all users
    const allUsersSentiment = users.map(user => ({
        user,
        sentiment: generateUserSentiment(user.id)
    }));

    // Generate aggregate dashboard data
    const aggregateData = {
        totalUsers: users.length,
        avgCompoundScore: allUsersSentiment.reduce((sum, u) => sum + u.sentiment.analysis.compound, 0) / users.length,
        riskDistribution: {
            high: allUsersSentiment.filter(u => u.sentiment.riskAssessment.level === 'High').length,
            medium: allUsersSentiment.filter(u => u.sentiment.riskAssessment.level === 'Medium').length,
            low: allUsersSentiment.filter(u => u.sentiment.riskAssessment.level === 'Low').length
        },
        sentimentDistribution: {
            positive: allUsersSentiment.reduce((sum, u) => sum + u.sentiment.analysis.positive, 0) / users.length,
            negative: allUsersSentiment.reduce((sum, u) => sum + u.sentiment.analysis.negative, 0) / users.length,
            neutral: allUsersSentiment.reduce((sum, u) => sum + u.sentiment.analysis.neutral, 0) / users.length
        },
        topConcerns: concerns.map(concern => ({
            name: concern,
            frequency: Math.floor(Math.random() * 15) + 5,
            trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)]
        })).sort((a, b) => b.frequency - a.frequency).slice(0, 5),
        weeklyTrends: generateTimelineData(7)
    };

    return {
        users: allUsersSentiment,
        aggregate: aggregateData,
        getUserSentiment: (userId) => allUsersSentiment.find(u => u.user.id === parseInt(userId))?.sentiment,
        getUserByName: (username) => allUsersSentiment.find(u => u.user.name === username)
    };
};

// Export singleton instance
export const mockSentimentAPI = generateMockSentimentData();

// Utility functions for formatting
export const formatSentimentScore = (score) => {
    if (score > 0.1) return { label: 'Positive', color: 'text-green-600', bg: 'bg-green-100' };
    if (score < -0.1) return { label: 'Negative', color: 'text-red-600', bg: 'bg-red-100' };
    return { label: 'Neutral', color: 'text-gray-600', bg: 'bg-gray-100' };
};

export const formatRiskLevel = (level) => {
    switch (level) {
        case 'High': return { color: 'text-red-600', bg: 'bg-red-100', icon: '🔴' };
        case 'Medium': return { color: 'text-orange-600', bg: 'bg-orange-100', icon: '🟡' };
        case 'Low': return { color: 'text-green-600', bg: 'bg-green-100', icon: '🟢' };
        default: return { color: 'text-gray-600', bg: 'bg-gray-100', icon: '⚪' };
    }
};

export const formatTrend = (trend) => {
    switch (trend) {
        case 'improving': return { label: 'Improving', color: 'text-green-600', icon: '📈' };
        case 'declining': return { label: 'Declining', color: 'text-red-600', icon: '📉' };
        case 'stable': return { label: 'Stable', color: 'text-blue-600', icon: '➡️' };
        default: return { label: 'Unknown', color: 'text-gray-600', icon: '❓' };
    }
};
