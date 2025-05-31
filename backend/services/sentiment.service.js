import vader from 'vader-sentiment';
import translate from 'translate';

// Configure translate engine (default is google)
translate.engine = 'google';

class SentimentService {
    constructor() {
        // Define sentiment categories mapping
        this.sentimentCategories = {
            'very_negative': { min: -1, max: -0.6 },
            'negative': { min: -0.6, max: -0.2 },
            'neutral': { min: -0.2, max: 0.2 },
            'positive': { min: 0.2, max: 0.6 },
            'very_positive': { min: 0.6, max: 1 }
        };
    }

    /**
     * Map VADER compound score to sentiment categories
     * @param {number} compoundScore - VADER compound score (-1 to 1)
     * @returns {string} - Sentiment category
     */
    mapToSentimentCategory(compoundScore) {
        for (const [category, range] of Object.entries(this.sentimentCategories)) {
            if (compoundScore >= range.min && compoundScore <= range.max) {
                return category;
            }
        }
        return 'neutral'; // Default fallback
    }

    /**
     * Detect if text contains Tagalog words (basic detection)
     * @param {string} text - Text to analyze
     * @returns {boolean} - True if likely contains Tagalog
     */
    isTagalogText(text) {
        // Common Tagalog words and particles for detection
        const tagalogIndicators = [
            'ang', 'ng', 'sa', 'kay', 'para', 'dahil', 'kasi', 'pero', 'at', 'o',
            'ako', 'ikaw', 'siya', 'tayo', 'kayo', 'sila', 'ko', 'mo', 'niya',
            'namin', 'ninyo', 'nila', 'kami', 'kita', 'na', 'pa', 'ba', 'po',
            'opo', 'hindi', 'oo', 'salamat', 'kumusta', 'mahal', 'galit',
            'malungkot', 'masaya', 'takot', 'lungkot', 'saya', 'masakit',
            'pagod', 'stress', 'problema', 'lagi', 'palagi', 'minsan',
            'kapag', 'kung', 'paano', 'bakit', 'saan', 'kelan', 'sino',
            'isip', 'puso', 'damdamin', 'nararamdaman', 'nakakalungkot',
            'nakakagalit', 'nakakatakot', 'nakakasaya'
        ];

        const lowerText = text.toLowerCase();
        return tagalogIndicators.some(word =>
            lowerText.includes(` ${word} `) ||
            lowerText.startsWith(`${word} `) ||
            lowerText.endsWith(` ${word}`) ||
            lowerText === word
        );
    }

    /**
     * Translate text from Tagalog to English
     * @param {string} text - Text to translate
     * @returns {Promise<string>} - Translated text
     */
    async translateToEnglish(text) {
        try {
            // Only translate if text appears to be in Tagalog
            if (!this.isTagalogText(text)) {
                return text;
            }

            const translated = await translate(text, { from: 'tl', to: 'en' });
            return translated;
        } catch (error) {
            console.warn('Translation failed, using original text:', error.message);
            return text;
        }
    }

    /**
     * Analyze sentiment of individual words
     * @param {string} text - Text to analyze
     * @returns {Array} - Array of word sentiment objects
     */
    analyzeWordSentiments(text) {
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ') // Remove punctuation
            .split(/\s+/)
            .filter(word => word.length > 0);

        return words.map(word => {
            const wordAnalysis = vader.SentimentIntensityAnalyzer.polarity_scores(word);
            return {
                word: word,
                sentiment: {
                    compound: wordAnalysis.compound,
                    positive: wordAnalysis.pos,
                    negative: wordAnalysis.neg,
                    neutral: wordAnalysis.neu,
                    category: this.mapToSentimentCategory(wordAnalysis.compound)
                }
            };
        });
    }

    /**
     * Perform comprehensive sentiment analysis
     * @param {string} text - Text to analyze
     * @param {Object} options - Analysis options
     * @returns {Promise<Object>} - Complete sentiment analysis result
     */
    async analyzeSentiment(text, options = {}) {
        try {
            if (!text || typeof text !== 'string' || text.trim().length === 0) {
                throw new Error('Invalid input text');
            }

            const originalText = text.trim();
            let processedText = originalText;

            // Translation step
            let translationInfo = {
                wasTranslated: false,
                originalLanguage: 'en',
                translatedText: null
            };

            if (options.enableTranslation !== false) {
                const translatedText = await this.translateToEnglish(originalText);
                if (translatedText !== originalText) {
                    translationInfo = {
                        wasTranslated: true,
                        originalLanguage: 'tl',
                        translatedText: translatedText
                    };
                    processedText = translatedText;
                }
            }

            // Overall sentiment analysis
            const overallAnalysis = vader.SentimentIntensityAnalyzer.polarity_scores(processedText);

            // Word-by-word sentiment analysis
            const wordSentiments = this.analyzeWordSentiments(processedText);

            // Calculate additional metrics
            const totalWords = wordSentiments.length;
            const sentimentDistribution = {
                very_negative: wordSentiments.filter(w => w.sentiment.category === 'very_negative').length,
                negative: wordSentiments.filter(w => w.sentiment.category === 'negative').length,
                neutral: wordSentiments.filter(w => w.sentiment.category === 'neutral').length,
                positive: wordSentiments.filter(w => w.sentiment.category === 'positive').length,
                very_positive: wordSentiments.filter(w => w.sentiment.category === 'very_positive').length
            };

            // Calculate percentages
            const sentimentPercentages = {};
            Object.keys(sentimentDistribution).forEach(category => {
                sentimentPercentages[category] = totalWords > 0
                    ? ((sentimentDistribution[category] / totalWords) * 100).toFixed(2)
                    : 0;
            });

            // Find most emotional words
            const emotionalWords = wordSentiments
                .filter(w => Math.abs(w.sentiment.compound) > 0.3)
                .sort((a, b) => Math.abs(b.sentiment.compound) - Math.abs(a.sentiment.compound))
                .slice(0, 5);

            return {
                input: {
                    originalText: originalText,
                    processedText: processedText,
                    wordCount: totalWords
                },
                translation: translationInfo,
                overall: {
                    compound: overallAnalysis.compound,
                    positive: overallAnalysis.pos,
                    negative: overallAnalysis.neg,
                    neutral: overallAnalysis.neu,
                    category: this.mapToSentimentCategory(overallAnalysis.compound),
                    intensity: Math.abs(overallAnalysis.compound)
                },
                wordAnalysis: {
                    words: wordSentiments,
                    distribution: sentimentDistribution,
                    percentages: sentimentPercentages,
                    mostEmotionalWords: emotionalWords
                },
                metadata: {
                    analysisTimestamp: new Date().toISOString(),
                    vaderVersion: 'latest',
                    totalProcessingWords: totalWords
                }
            };

        } catch (error) {
            console.error('Sentiment analysis error:', error);
            throw new Error(`Sentiment analysis failed: ${error.message}`);
        }
    }

    /**
     * Quick sentiment analysis for simple use cases
     * @param {string} text - Text to analyze
     * @returns {Promise<Object>} - Simplified sentiment result
     */
    async quickAnalyze(text) {
        try {
            const result = await this.analyzeSentiment(text);
            return {
                text: result.input.originalText,
                sentiment: result.overall.category,
                score: result.overall.compound,
                confidence: result.overall.intensity,
                wasTranslated: result.translation.wasTranslated
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Batch analyze multiple texts
     * @param {Array<string>} texts - Array of texts to analyze
     * @param {Object} options - Analysis options
     * @returns {Promise<Array>} - Array of sentiment analysis results
     */
    async batchAnalyze(texts, options = {}) {
        if (!Array.isArray(texts)) {
            throw new Error('Input must be an array of texts');
        }

        const results = [];
        for (const text of texts) {
            try {
                const result = options.detailed
                    ? await this.analyzeSentiment(text, options)
                    : await this.quickAnalyze(text);
                results.push(result);
            } catch (error) {
                results.push({
                    error: error.message,
                    text: text
                });
            }
        }

        return results;
    }

    /**
     * Get sentiment trend over time for conversation analysis
     * @param {Array<Object>} messages - Array of message objects with text and timestamp
     * @returns {Promise<Object>} - Sentiment trend analysis
     */
    async analyzeSentimentTrend(messages) {
        if (!Array.isArray(messages)) {
            throw new Error('Messages must be an array');
        }

        const results = [];
        let overallScores = [];

        for (const message of messages) {
            try {
                const analysis = await this.quickAnalyze(message.text);
                results.push({
                    ...analysis,
                    timestamp: message.timestamp,
                    messageId: message.id
                });
                overallScores.push(analysis.score);
            } catch (error) {
                console.warn('Failed to analyze message:', error.message);
            }
        }

        // Calculate trend metrics
        const averageScore = overallScores.length > 0
            ? overallScores.reduce((sum, score) => sum + score, 0) / overallScores.length
            : 0;

        const sentimentTrend = overallScores.length > 1
            ? overallScores[overallScores.length - 1] - overallScores[0]
            : 0;

        return {
            messages: results,
            summary: {
                totalMessages: results.length,
                averageSentiment: averageScore,
                overallCategory: this.mapToSentimentCategory(averageScore),
                trend: sentimentTrend > 0 ? 'improving' : sentimentTrend < 0 ? 'declining' : 'stable',
                trendScore: sentimentTrend
            }
        };
    }
}

// Create and export singleton instance
const sentimentService = new SentimentService();
export default sentimentService;