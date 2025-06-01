import vader from 'vader-sentiment';
import translate from 'translate';
import { normalizeText } from 'normalize-text';
import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const client = new InferenceClient(process.env.HF_SENTIBOT_TOKEN);

const PROVIDER = "fireworks-ai";
const MODEL = "meta-llama/Llama-3.1-8B-Instruct";
const PROMPT = `You are an expert sentiment analysis interpreter and emotional intelligence consultant. Your task is to provide deep contextual interpretation of rule-based VADER sentiment analysis results.

You must respond ONLY in the following JSON format:

{
  "interpretation": {
    "emotional_state": "string describing the likely emotional state",
    "contextual_meaning": "deeper meaning behind the sentiment scores",
    "psychological_indicators": ["indicator1", "indicator2", "indicator3"],
    "communication_style": "description of how the person is expressing themselves"
  },
  "analytics": {
    "sentiment_strength": "weak|moderate|strong|very_strong",
    "emotional_complexity": 0.75,
    "language_patterns": ["pattern1", "pattern2"],
    "risk_indicators": ["risk1", "risk2"],
    "positive_indicators": ["positive1", "positive2"]
  },
  "insights": {
    "primary_emotion": "dominant emotion detected",
    "secondary_emotions": ["emotion1", "emotion2"],
    "emotional_trajectory": "improving|declining|stable|fluctuating",
    "intervention_suggestions": ["suggestion1", "suggestion2"],
    "support_recommendations": ["recommendation1", "recommendation2"]
  },
  "validation": {
    "vader_alignment": "high|medium|low",
    "confidence_level": 0.85,
    "analysis_reliability": "high|medium|low",
    "potential_biases": ["bias1", "bias2"]
  },
  "clinical_notes": {
    "concern_level": "low|moderate|high|critical",
    "follow_up_needed": true,
    "professional_referral": "none|counselor|therapist|psychiatrist|crisis",
    "urgency_score": 0.3
  }
}

Guidelines:
- Base your interpretation on the provided VADER scores and word analysis
- Consider cultural and linguistic nuances, especially for translated text
- Provide actionable insights for mental health support
- Be empathetic but professional in your analysis
- Flag any concerning patterns or risk indicators
- DO NOT include any extra commentary outside the JSON`;

// Configure translate engine (default is google)
const TRANSLATE_ENGINE = 'google';
translate.engine = TRANSLATE_ENGINE;

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

        // Word analysis prompt for LLM
        this.WORD_ANALYSIS_PROMPT = `You are a multilingual sentiment analyzer. Analyze ONLY emotionally significant words in the text.

IMPORTANT FILTERING RULES:
- Include ONLY words with positive or negative sentiment (compound score > 0.2 or < -0.2)
- SKIP neutral words (articles, prepositions, pronouns unless emotionally charged)
- SKIP words with compound scores between -0.2 and 0.2
- Focus on emotionally meaningful words: adjectives, emotional verbs, sentiment-loaded nouns

Return ONLY this JSON format:

{
  "wordAnalysis": [
    {
      "word": "original_word",
      "language": "tagalog|english|mixed", 
      "position": 0,
      "sentiment": {
        "compound": 0.0,
        "category": "positive|negative"
      },
      "translation": "english_if_needed",
      "emotional_weight": "medium|high"
    }
  ],
  "metadata": {
    "total_words_analyzed": 0,
    "significant_words": 0,
    "dominant_language": "tagalog|english|mixed"
  }
}

Rules:
- ONLY return words with strong sentiment (|compound| > 0.2)
- Use compound scores from -1.0 to 1.0
- Skip neutral/functional words
- Keep responses concise
- NO commentary, ONLY JSON`;
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
     * Normalize and preprocess text for better tokenization
     * @param {string} text - Text to normalize
     * @returns {string} - Normalized text
     */
    normalizeTextForTokenization(text) {
        // Handle common contractions by expanding them
        const contractions = {
            "don't": "do not",
            "doesn't": "does not",
            "didn't": "did not",
            "won't": "will not",
            "wouldn't": "would not",
            "shouldn't": "should not",
            "couldn't": "could not",
            "can't": "can not",
            "isn't": "is not",
            "aren't": "are not",
            "wasn't": "was not",
            "weren't": "were not",
            "haven't": "have not",
            "hasn't": "has not",
            "hadn't": "had not",
            "I'm": "I am",
            "you're": "you are",
            "he's": "he is",
            "she's": "she is",
            "it's": "it is",
            "we're": "we are",
            "they're": "they are",
            "I've": "I have",
            "you've": "you have",
            "we've": "we have",
            "they've": "they have",
            "I'll": "I will",
            "you'll": "you will",
            "he'll": "he will",
            "she'll": "she will",
            "it'll": "it will",
            "we'll": "we will",
            "they'll": "they will",
            "I'd": "I would",
            "you'd": "you would",
            "he'd": "he would",
            "she'd": "she would",
            "we'd": "we would",
            "they'd": "they would"
        };

        let normalizedText = text.toLowerCase();

        // Replace contractions with expanded forms
        Object.keys(contractions).forEach(contraction => {
            const regex = new RegExp('\\b' + contraction.replace(/'/g, "\\'") + '\\b', 'gi');
            normalizedText = normalizedText.replace(regex, contractions[contraction]);
        });

        return normalizedText;
    }

    /**
     * Analyze sentiment of individual words
     * @param {string} text - Text to analyze
     * @returns {Array} - Array of word sentiment objects
     */
    analyzeWordSentiments(text) {
        // First normalize contractions
        const normalizedText = this.normalizeTextForTokenization(text);

        // Then clean and tokenize
        const words = normalizedText
            .replace(/[^\w\s]/g, ' ') // Remove punctuation after normalization
            .split(/\s+/)
            .filter(word => word.length > 1); // Filter out single characters

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
                let translatedText = await this.translateToEnglish(originalText);
                translatedText = normalizeText(translatedText)

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

    /**
     * Enhanced sentiment analysis with LLM interpretation and analytics
     * Combines VADER rule-based analysis with LLM contextual understanding
     * @param {string} text - Text to analyze
     * @param {Object} options - Analysis options
     * @returns {Promise<Object>} - Enhanced sentiment analysis with LLM interpretation
     */
    async analyzeSentimentWithLLMInterpretation(text, options = {}) {
        try {
            // First, perform the standard VADER-based sentiment analysis
            const vaderAnalysis = await this.analyzeSentiment(text, options);

            // Prepare data for LLM interpretation
            const llmInterpretation = await this.getLLMSentimentInterpretation(vaderAnalysis);

            return {
                ...vaderAnalysis,
                llmInterpretation: {
                    analysis: llmInterpretation,
                    confidence: this.calculateLLMConfidence(vaderAnalysis, llmInterpretation),
                    alignment: this.checkVaderLLMAlignment(vaderAnalysis, llmInterpretation)
                },
                enhancedMetadata: {
                    ...vaderAnalysis.metadata,
                    llmModel: MODEL,
                    analysisMode: 'hybrid_vader_llm',
                    enhancedTimestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('Enhanced sentiment analysis error:', error);
            throw new Error(`Enhanced sentiment analysis failed: ${error.message}`);
        }
    }

    /**
     * Get LLM interpretation of VADER sentiment analysis
     * @param {Object} vaderAnalysis - Complete VADER analysis result
     * @returns {Promise<Object>} - LLM interpretation and insights
     */
    async getLLMSentimentInterpretation(vaderAnalysis) {
        try {
            const prompt = this.buildSentimentInterpretationPrompt(vaderAnalysis);

            const chatCompletion = await client.chatCompletion({
                provider: PROVIDER,
                model: MODEL,
                messages: [
                    {
                        role: "system",
                        content: PROMPT.trim()
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
            });

            // Parse the LLM response
            const parsed = JSON.parse(chatCompletion.choices[0].message.content);
            return parsed;

        } catch (error) {
            console.error("Failed to get LLM interpretation:", error);
            return {
                interpretation: null,
                analytics: null,
                insights: null,
                validation: null,
                clinical_notes: null,
                error: "Failed to parse LLM interpretation",
                fallback_analysis: this.generateFallbackInterpretation(vaderAnalysis)
            };
        }
    }

    /**
     * Build comprehensive prompt for LLM sentiment interpretation
     * @param {Object} vaderAnalysis - VADER analysis results
     * @returns {string} - Formatted prompt for LLM
     */
    buildSentimentInterpretationPrompt(vaderAnalysis) {
        const {
            input,
            translation,
            overall,
            wordAnalysis,
            metadata
        } = vaderAnalysis;

        return `
            Please provide a comprehensive interpretation and analysis of the following rule-based sentiment analysis results:

            ## ORIGINAL TEXT ANALYSIS
            - Original Text: "${input.originalText}"
            - Processed Text: "${input.processedText}"
            - Word Count: ${input.wordCount}
            - Translation Status: ${translation.wasTranslated ? 'Translated from ' + translation.originalLanguage : 'No translation needed'}

            ## VADER SENTIMENT SCORES
            - Overall Compound Score: ${overall.compound} (Range: -1.0 to 1.0)
            - Positive Score: ${overall.positive}
            - Negative Score: ${overall.negative}
            - Neutral Score: ${overall.neutral}
            - Sentiment Category: ${overall.category}
            - Emotional Intensity: ${overall.intensity}

            ## WORD-LEVEL ANALYSIS
            - Total Words Analyzed: ${wordAnalysis.words.length}
            - Sentiment Distribution:
            * Very Negative: ${wordAnalysis.distribution.very_negative} words (${wordAnalysis.percentages.very_negative}%)
            * Negative: ${wordAnalysis.distribution.negative} words (${wordAnalysis.percentages.negative}%)
            * Neutral: ${wordAnalysis.distribution.neutral} words (${wordAnalysis.percentages.neutral}%)
            * Positive: ${wordAnalysis.distribution.positive} words (${wordAnalysis.percentages.positive}%)
            * Very Positive: ${wordAnalysis.distribution.very_positive} words (${wordAnalysis.percentages.very_positive}%)

            ## MOST EMOTIONAL WORDS
            ${wordAnalysis.mostEmotionalWords.map(w =>
            `- "${w.word}": ${w.sentiment.compound} (${w.sentiment.category})`
        ).join('\n')}

            ## CONTEXT INFORMATION
            - Analysis Timestamp: ${metadata.analysisTimestamp}
            - Language Context: ${translation.wasTranslated ? 'Cross-cultural (Tagalog to English)' : 'Native English'}

            Based on this comprehensive VADER analysis, please provide your expert interpretation and insights in the specified JSON format.`.trim();
    }

    /**
     * Calculate confidence level between VADER and LLM analysis
     * @param {Object} vaderAnalysis - VADER results
     * @param {Object} llmInterpretation - LLM interpretation
     * @returns {number} - Confidence score (0-1)
     */
    calculateLLMConfidence(vaderAnalysis, llmInterpretation) {
        try {
            if (!llmInterpretation.validation) return 0.5;

            const vaderConfidence = Math.abs(vaderAnalysis.overall.compound);
            const llmConfidence = llmInterpretation.validation.confidence_level || 0.5;
            const alignmentScore = this.mapAlignmentToScore(llmInterpretation.validation.vader_alignment);

            // Weighted average of confidence factors
            return ((vaderConfidence * 0.3) + (llmConfidence * 0.5) + (alignmentScore * 0.2));
        } catch (error) {
            console.warn('Error calculating LLM confidence:', error);
            return 0.5;
        }
    }

    /**
     * Check alignment between VADER and LLM sentiment assessment
     * @param {Object} vaderAnalysis - VADER results
     * @param {Object} llmInterpretation - LLM interpretation
     * @returns {Object} - Alignment assessment
     */
    checkVaderLLMAlignment(vaderAnalysis, llmInterpretation) {
        try {
            const vaderCategory = vaderAnalysis.overall.category;
            const vaderScore = vaderAnalysis.overall.compound;

            if (!llmInterpretation.validation) {
                return {
                    category_match: 'unknown',
                    score_deviation: null,
                    overall_alignment: 'unknown',
                    notes: 'LLM validation data unavailable'
                };
            }

            const llmAlignment = llmInterpretation.validation.vader_alignment;
            const alignmentScore = this.mapAlignmentToScore(llmAlignment);

            return {
                category_match: vaderCategory,
                llm_alignment_rating: llmAlignment,
                score_deviation: Math.abs(vaderScore),
                overall_alignment: alignmentScore > 0.7 ? 'high' : alignmentScore > 0.4 ? 'medium' : 'low',
                confidence_delta: Math.abs((llmInterpretation.validation.confidence_level || 0.5) - Math.abs(vaderScore)),
                notes: `VADER: ${vaderCategory} (${vaderScore.toFixed(3)}), LLM alignment: ${llmAlignment}`
            };
        } catch (error) {
            console.warn('Error checking VADER-LLM alignment:', error);
            return {
                category_match: 'error',
                overall_alignment: 'unknown',
                notes: 'Alignment check failed'
            };
        }
    }

    /**
     * Map alignment rating to numerical score
     * @param {string} alignment - Alignment rating (high|medium|low)
     * @returns {number} - Numerical score (0-1)
     */
    mapAlignmentToScore(alignment) {
        const alignmentMap = {
            'high': 0.9,
            'medium': 0.6,
            'low': 0.3
        };
        return alignmentMap[alignment] || 0.5;
    }

    /**
     * Generate fallback interpretation when LLM fails
     * @param {Object} vaderAnalysis - VADER results
     * @returns {Object} - Basic fallback interpretation
     */
    generateFallbackInterpretation(vaderAnalysis) {
        const { overall, wordAnalysis } = vaderAnalysis;

        return {
            interpretation: {
                emotional_state: `${overall.category} emotional state detected`,
                contextual_meaning: `Text shows ${overall.intensity > 0.5 ? 'strong' : 'moderate'} ${overall.category} sentiment`,
                psychological_indicators: this.extractBasicIndicators(wordAnalysis),
                communication_style: 'Unable to determine without LLM analysis'
            },
            analytics: {
                sentiment_strength: overall.intensity > 0.7 ? 'strong' : overall.intensity > 0.4 ? 'moderate' : 'weak',
                emotional_complexity: overall.intensity,
                language_patterns: ['Rule-based analysis only'],
                risk_indicators: overall.category.includes('negative') ? ['Negative sentiment detected'] : [],
                positive_indicators: overall.category.includes('positive') ? ['Positive sentiment detected'] : []
            },
            source: 'fallback_vader_only'
        };
    }

    /**
     * Extract basic psychological indicators from word analysis
     * @param {Object} wordAnalysis - Word-level analysis results
     * @returns {Array} - Basic indicators
     */
    extractBasicIndicators(wordAnalysis) {
        const indicators = [];

        if (wordAnalysis.distribution.very_negative > 0) {
            indicators.push('Strong negative language detected');
        }
        if (wordAnalysis.distribution.very_positive > 0) {
            indicators.push('Strong positive language detected');
        }
        if (wordAnalysis.mostEmotionalWords.length > 3) {
            indicators.push('High emotional word density');
        }

        return indicators.length > 0 ? indicators : ['Standard emotional expression'];
    }

    /**
     * Quick LLM-enhanced sentiment analysis for simple use cases
     * @param {string} text - Text to analyze
     * @returns {Promise<Object>} - Simplified enhanced sentiment result
     */
    async quickAnalyzeWithLLM(text) {
        try {
            const result = await this.analyzeSentimentWithLLMInterpretation(text);
            return {
                text: result.input.originalText,
                vader: {
                    sentiment: result.overall.category,
                    score: result.overall.compound,
                    confidence: result.overall.intensity
                },
                llm: {
                    emotional_state: result.llmInterpretation.analysis?.interpretation?.emotional_state || 'Unknown',
                    concern_level: result.llmInterpretation.analysis?.clinical_notes?.concern_level || 'Unknown',
                    confidence: result.llmInterpretation.confidence || 0.5,
                    alignment: result.llmInterpretation.alignment?.overall_alignment || 'Unknown'
                },
                enhanced: {
                    wasTranslated: result.translation.wasTranslated,
                    analysisMode: 'hybrid_vader_llm',
                    timestamp: result.enhancedMetadata.enhancedTimestamp
                }
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Main comprehensive sentiment analysis method with LLM toggle
     * @param {string} text - Text to analyze
     * @param {Object} options - Analysis options
     * @param {boolean} options.enableLLM - Enable/disable LLM analysis
     * @param {boolean} options.enableLLMWordAnalysis - Enable/disable LLM word analysis
     * @param {boolean} options.enableTranslation - Enable/disable translation
     * @returns {Promise<Object>} - Complete sentiment analysis result
     */
    async analyzeSentimentComplete(text, options = {}) {
        try {
            const {
                enableLLM = false,
                enableLLMWordAnalysis = false,
                enableTranslation = true
            } = options;

            // Use existing analyzeSentiment as base, then enhance with LLM if enabled
            const baseResult = await this.analyzeSentiment(text, { enableTranslation });

            // If no LLM features enabled, return base result
            if (!enableLLM && !enableLLMWordAnalysis) {
                return {
                    ...baseResult,
                    enhancedMetadata: {
                        ...baseResult.metadata,
                        llmEnabled: false,
                        llmWordAnalysisEnabled: false,
                        analysisMode: 'vader_only'
                    }
                };
            }

            let result = { ...baseResult };

            // Add LLM word analysis if enabled
            if (enableLLMWordAnalysis) {
                try {
                    const llmWordAnalysis = await this.getLLMWordAnalysis(text.trim());

                    result.llmWordAnalysis = {
                        ...llmWordAnalysis,
                        comparison: this.compareWordAnalyses(baseResult.wordAnalysis.words, llmWordAnalysis.wordAnalysis)
                    };
                } catch (error) {
                    console.warn('LLM word analysis failed:', error.message);
                    result.llmWordAnalysis = {
                        error: 'LLM word analysis failed',
                        fallback: true
                    };
                }
            }

            // Add LLM interpretation if enabled
            if (enableLLM) {
                try {
                    const llmInterpretation = await this.getLLMSentimentInterpretation(result);

                    result.llmInterpretation = {
                        analysis: llmInterpretation,
                        confidence: this.calculateLLMConfidence(result, llmInterpretation),
                        alignment: this.checkVaderLLMAlignment(result, llmInterpretation)
                    };
                } catch (error) {
                    console.warn('LLM interpretation failed:', error.message);
                    result.llmInterpretation = {
                        error: 'LLM interpretation failed',
                        fallback_analysis: this.generateFallbackInterpretation(result)
                    };
                }
            }

            // Update metadata
            result.enhancedMetadata = {
                ...result.metadata,
                llmEnabled: enableLLM,
                llmWordAnalysisEnabled: enableLLMWordAnalysis,
                translationEnabled: enableTranslation,
                analysisMode: enableLLM && enableLLMWordAnalysis ? 'hybrid_full_llm' :
                    enableLLM ? 'vader_with_llm_interpretation' :
                        enableLLMWordAnalysis ? 'vader_with_llm_words' : 'vader_only',
                enhancedTimestamp: new Date().toISOString()
            };

            return result;

        } catch (error) {
            console.error('Complete sentiment analysis error:', error);
            throw new Error(`Complete sentiment analysis failed: ${error.message}`);
        }
    }

    /**
     * Compare VADER and LLM word analyses
     * @param {Array} vaderWords - VADER word analysis results
     * @param {Array} llmWords - LLM word analysis results
     * @returns {Object} - Comparison metrics
     */
    compareWordAnalyses(vaderWords, llmWords) {
        try {
            const comparison = {
                word_count_match: vaderWords.length === llmWords.length,
                vader_words: vaderWords.length,
                llm_words: llmWords.length,
                sentiment_alignment: [],
                language_insights: {
                    vader_detected_tagalog: 0,
                    llm_detected_tagalog: 0,
                    llm_detected_english: 0,
                    llm_detected_mixed: 0
                },
                alignment_score: 0
            };

            // Count VADER's Tagalog detection
            vaderWords.forEach(word => {
                if (this.isTagalogText(word.word)) {
                    comparison.language_insights.vader_detected_tagalog++;
                }
            });

            // Count LLM's language detection
            llmWords.forEach(word => {
                switch (word.language?.toLowerCase()) {
                    case 'tagalog':
                        comparison.language_insights.llm_detected_tagalog++;
                        break;
                    case 'english':
                        comparison.language_insights.llm_detected_english++;
                        break;
                    case 'mixed':
                        comparison.language_insights.llm_detected_mixed++;
                        break;
                }
            });

            // Compare sentiment alignment for matching words
            const minLength = Math.min(vaderWords.length, llmWords.length);
            let alignmentSum = 0;

            for (let i = 0; i < minLength; i++) {
                const vaderWord = vaderWords[i];
                const llmWord = llmWords[i];

                const scoreDifference = Math.abs(vaderWord.sentiment.compound - llmWord.sentiment.compound);
                const categoryMatch = vaderWord.sentiment.category === llmWord.sentiment.category;

                const wordAlignment = {
                    position: i,
                    vader_word: vaderWord.word,
                    llm_word: llmWord.word,
                    word_match: vaderWord.word.toLowerCase() === llmWord.word.toLowerCase(),
                    vader_score: vaderWord.sentiment.compound,
                    llm_score: llmWord.sentiment.compound,
                    score_difference: scoreDifference,
                    category_match: categoryMatch,
                    alignment_rating: scoreDifference < 0.3 ? 'high' : scoreDifference < 0.6 ? 'medium' : 'low'
                };

                comparison.sentiment_alignment.push(wordAlignment);
                alignmentSum += categoryMatch ? 1 : 0;
            }

            comparison.alignment_score = minLength > 0 ? (alignmentSum / minLength) : 0;
            comparison.overall_alignment = comparison.alignment_score > 0.7 ? 'high' :
                comparison.alignment_score > 0.4 ? 'medium' : 'low';

            return comparison;

        } catch (error) {
            console.warn('Word analysis comparison failed:', error);
            return {
                error: 'Comparison failed',
                vader_words: vaderWords.length,
                llm_words: llmWords ? llmWords.length : 0
            };
        }
    }

    /**
     * Batch analyze multiple texts with LLM enhancement
     * @param {Array<string>} texts - Array of texts to analyze
     * @param {Object} options - Analysis options
     * @returns {Promise<Array>} - Array of enhanced sentiment analysis results
     */
    async batchAnalyzeWithLLM(texts, options = {}) {
        if (!Array.isArray(texts)) {
            throw new Error('Input must be an array of texts');
        }

        const results = [];
        for (const text of texts) {
            try {
                const result = options.detailed
                    ? await this.analyzeSentimentComplete(text, {
                        enableLLM: true,
                        enableLLMWordAnalysis: options.enableLLMWordAnalysis || false,
                        enableTranslation: options.enableTranslation !== false
                    })
                    : await this.quickAnalyzeWithLLM(text);
                results.push(result);
            } catch (error) {
                results.push({
                    error: error.message,
                    text: text,
                    fallback: await this.quickAnalyze(text).catch(() => null)
                });
            }
        }

        return results;
    }

    /**
     * Get LLM-based word-by-word sentiment analysis for any language
     * @param {string} text - Original text to analyze
     * @returns {Promise<Object>} - LLM word analysis results
     */
    async getLLMWordAnalysis(text) {
        let result;
        try {
            // Limit text length to prevent token overflow
            const maxLength = 300;
            const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

            // Add timeout wrapper (20 seconds)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('LLM request timeout')), 20000)
            );

            const llmPromise = client.chatCompletion({
                provider: PROVIDER,
                model: MODEL,
                messages: [
                    {
                        role: "system",
                        content: this.WORD_ANALYSIS_PROMPT.trim()
                    },
                    {
                        role: "user",
                        content: `Find and analyze ONLY emotionally significant words (positive/negative sentiment) in this text: "${truncatedText}"`
                    },
                ],
            });

            const chatCompletion = await Promise.race([llmPromise, timeoutPromise]);

            // Parse and validate the LLM response
            result = chatCompletion.choices[0].message.content;
            const parsed = JSON.parse(result);
            return this.validateLLMWordAnalysis(parsed, text);

        } catch (error) {
            console.error("Failed to get LLM word analysis:", error);
            if (result) {
                console.log("Raw LLM Response (first 300 chars):", result.substring(0, 300));
            }
            return this.generateFallbackWordAnalysis(text);
        }
    }

    /**
     * Validate LLM word analysis response format
     * @param {Object} llmResponse - Raw LLM response
     * @param {string} originalText - Original input text
     * @returns {Object} - Validated and normalized word analysis
     */
    validateLLMWordAnalysis(llmResponse, originalText) {
        try {
            // Validate required structure
            if (!llmResponse.wordAnalysis || !Array.isArray(llmResponse.wordAnalysis)) {
                throw new Error('Invalid wordAnalysis structure');
            }

            const validatedWords = llmResponse.wordAnalysis.map((wordObj, index) => {
                // Validate each word object
                if (!wordObj.word || !wordObj.sentiment) {
                    throw new Error(`Invalid word object at position ${index}`);
                }

                // Normalize sentiment scores for significant words only
                const compoundScore = this.clampScore(wordObj.sentiment.compound || 0);

                // Skip if this is somehow a neutral word that slipped through
                if (Math.abs(compoundScore) < 0.2) {
                    console.warn(`Filtering out low-sentiment word: ${wordObj.word} (${compoundScore})`);
                    return null;
                }

                const sentiment = {
                    compound: compoundScore,
                    positive: compoundScore > 0 ? Math.abs(compoundScore) : 0,
                    negative: compoundScore < 0 ? Math.abs(compoundScore) : 0,
                    neutral: 0, // No neutral words in optimized analysis
                    category: wordObj.sentiment.category || this.mapToSentimentCategory(compoundScore),
                    intensity: Math.abs(compoundScore)
                };

                return {
                    word: wordObj.word,
                    language: wordObj.language || 'english',
                    position: wordObj.position || index,
                    sentiment: sentiment,
                    translation: wordObj.translation || null,
                    emotional_weight: wordObj.emotional_weight || (Math.abs(compoundScore) > 0.5 ? 'high' : 'medium'),
                    context_relevance: 1.0, // All words returned are contextually relevant
                    source: 'llm_significant'
                };
            }).filter(word => word !== null); // Remove filtered words

            // Validate metadata with updated structure
            const totalWordsInText = originalText.split(/\s+/).length;
            const metadata = {
                total_words_in_text: totalWordsInText,
                significant_words_found: validatedWords.length,
                language_distribution: this.calculateLanguageDistribution(validatedWords),
                dominant_language: this.determineDominantLanguage(validatedWords),
                analysis_timestamp: new Date().toISOString(),
                validation_status: 'optimized_significant_only',
                efficiency_ratio: (validatedWords.length / totalWordsInText).toFixed(2)
            };

            return {
                wordAnalysis: validatedWords,
                metadata: metadata,
                isValid: true
            };

        } catch (error) {
            console.warn('LLM word analysis validation failed:', error.message);
            return this.generateFallbackWordAnalysis(originalText);
        }
    }

    /**
     * Clamp score to valid range
     * @param {number} score - Score to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} - Clamped score
     */
    clampScore(score, min = -1, max = 1) {
        return Math.max(min, Math.min(max, score));
    }

    /**
     * Calculate language distribution from word analysis
     * @param {Array} words - Array of word objects
     * @returns {Object} - Language distribution counts
     */
    calculateLanguageDistribution(words) {
        const distribution = { tagalog: 0, english: 0, mixed: 0 };
        words.forEach(word => {
            const lang = word.language.toLowerCase();
            if (distribution.hasOwnProperty(lang)) {
                distribution[lang]++;
            }
        });
        return distribution;
    }

    /**
     * Determine dominant language from word analysis
     * @param {Array} words - Array of word objects
     * @returns {string} - Dominant language
     */
    determineDominantLanguage(words) {
        const distribution = this.calculateLanguageDistribution(words);
        return Object.keys(distribution).reduce((a, b) =>
            distribution[a] > distribution[b] ? a : b
        );
    }

    /**
     * Generate fallback word analysis when LLM fails
     * @param {string} text - Original text
     * @returns {Object} - Fallback word analysis
     */
    generateFallbackWordAnalysis(text) {
        try {
            // Use existing VADER-based analysis as fallback, filtering for significant words only
            const vaderWords = this.analyzeWordSentiments(text);
            const originalWords = text.split(/\s+/);

            const fallbackWords = originalWords.map((word, index) => {
                const vaderResult = vaderWords[index] || {
                    word: word,
                    sentiment: { compound: 0, positive: 0, negative: 0, neutral: 1, category: 'neutral' }
                };

                // Filter out neutral words (compound score between -0.2 and 0.2)
                if (Math.abs(vaderResult.sentiment.compound) < 0.2) {
                    return null;
                }

                return {
                    word: word,
                    language: this.isTagalogText(word) ? 'tagalog' : 'english',
                    position: index,
                    sentiment: {
                        compound: vaderResult.sentiment.compound,
                        positive: vaderResult.sentiment.compound > 0 ? Math.abs(vaderResult.sentiment.compound) : 0,
                        negative: vaderResult.sentiment.compound < 0 ? Math.abs(vaderResult.sentiment.compound) : 0,
                        neutral: 0, // No neutral words in optimized analysis
                        category: vaderResult.sentiment.category,
                        intensity: Math.abs(vaderResult.sentiment.compound)
                    },
                    translation: null,
                    emotional_weight: Math.abs(vaderResult.sentiment.compound) > 0.5 ? 'high' : 'medium',
                    context_relevance: 1.0, // All returned words are significant
                    source: 'vader_fallback_significant'
                };
            }).filter(word => word !== null); // Remove neutral words

            return {
                wordAnalysis: fallbackWords,
                metadata: {
                    total_words_in_text: originalWords.length,
                    significant_words_found: fallbackWords.length,
                    language_distribution: this.calculateLanguageDistribution(fallbackWords),
                    dominant_language: this.determineDominantLanguage(fallbackWords),
                    analysis_timestamp: new Date().toISOString(),
                    validation_status: 'fallback_significant_only',
                    efficiency_ratio: (fallbackWords.length / originalWords.length).toFixed(2)
                },
                isValid: false,
                fallback: true
            };

        } catch (error) {
            console.error('Fallback word analysis failed:', error);
            return {
                wordAnalysis: [],
                metadata: { total_words: 0, validation_status: 'failed' },
                isValid: false,
                error: error.message
            };
        }
    }

    /**
     * Main comprehensive sentiment analysis method with LLM toggle
     * @param {string} text - Text to analyze
     * @param {Object} options - Analysis options
     * @param {boolean} options.enableLLM - Enable/disable LLM interpretation
     * @param {boolean} options.enableLLMWordAnalysis - Enable/disable LLM word analysis
     * @param {boolean} options.enableTranslation - Enable/disable translation
     * @returns {Promise<Object>} - Complete sentiment analysis result
     */
    async analyzeSentimentComplete(text, options = {}) {
        try {
            const {
                enableLLM = false,
                enableLLMWordAnalysis = false,
                enableTranslation = true
            } = options;

            // Use existing analyzeSentiment as base
            const baseResult = await this.analyzeSentiment(text, { enableTranslation });

            // If no LLM features enabled, return base result with enhanced metadata
            if (!enableLLM && !enableLLMWordAnalysis) {
                return {
                    ...baseResult,
                    enhancedMetadata: {
                        ...baseResult.metadata,
                        llmEnabled: false,
                        llmWordAnalysisEnabled: false,
                        analysisMode: 'vader_only',
                        enhancedTimestamp: new Date().toISOString()
                    }
                };
            }

            let result = { ...baseResult };

            // Add LLM word analysis if enabled
            if (enableLLMWordAnalysis) {
                try {
                    const llmWordAnalysis = await this.getLLMWordAnalysis(text.trim());

                    result.llmWordAnalysis = {
                        ...llmWordAnalysis,
                        comparison: this.compareWordAnalyses(baseResult.wordAnalysis.words, llmWordAnalysis.wordAnalysis)
                    };
                } catch (error) {
                    console.warn('LLM word analysis failed:', error.message);
                    result.llmWordAnalysis = {
                        error: 'LLM word analysis failed',
                        fallback: true
                    };
                }
            }

            // Add LLM interpretation if enabled
            if (enableLLM) {
                try {
                    const llmInterpretation = await this.getLLMSentimentInterpretation(result);

                    result.llmInterpretation = {
                        analysis: llmInterpretation,
                        confidence: this.calculateLLMConfidence(result, llmInterpretation),
                        alignment: this.checkVaderLLMAlignment(result, llmInterpretation)
                    };
                } catch (error) {
                    console.warn('LLM interpretation failed:', error.message);
                    result.llmInterpretation = {
                        error: 'LLM interpretation failed',
                        fallback_analysis: this.generateFallbackInterpretation(result)
                    };
                }
            }

            // Update metadata
            result.enhancedMetadata = {
                ...result.metadata,
                llmEnabled: enableLLM,
                llmWordAnalysisEnabled: enableLLMWordAnalysis,
                translationEnabled: enableTranslation,
                analysisMode: enableLLM && enableLLMWordAnalysis ? 'hybrid_full_llm' :
                    enableLLM ? 'vader_with_llm_interpretation' :
                        enableLLMWordAnalysis ? 'vader_with_llm_words' : 'vader_only',
                enhancedTimestamp: new Date().toISOString()
            };

            return result;

        } catch (error) {
            console.error('Complete sentiment analysis error:', error);
            throw new Error(`Complete sentiment analysis failed: ${error.message}`);
        }
    }

    /**
     * Batch analyze multiple texts with complete LLM options
     * @param {Array<string>} texts - Array of texts to analyze
     * @param {Object} options - Analysis options
     * @returns {Promise<Array>} - Array of complete sentiment analysis results
     */
    async batchAnalyzeComplete(texts, options = {}) {
        if (!Array.isArray(texts)) {
            throw new Error('Input must be an array of texts');
        }

        const results = [];
        for (const text of texts) {
            try {
                const result = await this.analyzeSentimentComplete(text, options);
                results.push(result);
            } catch (error) {
                results.push({
                    error: error.message,
                    text: text,
                    fallback: await this.quickAnalyze(text).catch(() => null)
                });
            }
        }

        return results;
    }

    /**
     * Quick analysis with word-level LLM analysis
     * @param {string} text - Text to analyze
     * @returns {Promise<Object>} - Quick results with word analysis
     */
    async quickAnalyzeWithWordLLM(text) {
        try {
            const result = await this.analyzeSentimentComplete(text, {
                enableLLM: false,
                enableLLMWordAnalysis: true
            });

            return {
                text: result.input.originalText,
                vader: {
                    sentiment: result.overall.category,
                    score: result.overall.compound,
                    confidence: result.overall.intensity
                },
                wordAnalysis: {
                    vader_words: result.wordAnalysis.words.length,
                    llm_words: result.llmWordAnalysis?.wordAnalysis?.length || 0,
                    language_insights: result.llmWordAnalysis?.comparison?.language_insights || {},
                    alignment: result.llmWordAnalysis?.comparison?.overall_alignment || 'unknown'
                },
                enhanced: {
                    wasTranslated: result.translation.wasTranslated,
                    analysisMode: result.enhancedMetadata.analysisMode,
                    timestamp: result.enhancedMetadata.enhancedTimestamp
                }
            };
        } catch (error) {
            throw error;
        }
    }
}

// Create and export singleton instance
const sentimentService = new SentimentService();
export default sentimentService;