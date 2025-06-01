# LLM-Enhanced Sentiment Analysis

This enhancement integrates Large Language Model (LLM) interpretation with the existing VADER rule-based sentiment analysis to provide deeper contextual understanding and reduce hallucination risks.

## 🎯 Features

### 1. Hybrid Analysis Approach
- **VADER Foundation**: Rule-based sentiment scoring as the baseline
- **LLM Interpretation**: Contextual analysis and psychological insights
- **Cross-Validation**: Alignment checking between VADER and LLM results
- **Fallback Safety**: Graceful degradation when LLM fails

### 2. New Methods Available

#### `analyzeSentimentWithLLMInterpretation(text, options)`
Comprehensive analysis that includes:
- Complete VADER analysis (as before)
- LLM interpretation and insights
- Confidence scoring and alignment assessment
- Clinical notes and risk indicators

#### `quickAnalyzeWithLLM(text)`
Simplified analysis for quick use cases:
- Essential VADER scores
- Key LLM insights
- Alignment confidence
- Processing metadata

#### `batchAnalyzeWithLLM(texts, options)`
Batch processing with LLM enhancement:
- Process multiple texts efficiently
- Error handling with fallback to VADER-only
- Detailed or quick analysis modes

## 📊 Enhanced Data Structure

The LLM-enhanced analysis adds these new fields to the existing structure:

```json
{
  // ... existing VADER analysis fields ...
  "llmInterpretation": {
    "analysis": {
      "interpretation": {
        "emotional_state": "anxious and overwhelmed",
        "contextual_meaning": "Expression of stress and feeling unable to cope",
        "psychological_indicators": ["stress", "overwhelm", "anxiety"],
        "communication_style": "direct emotional expression"
      },
      "analytics": {
        "sentiment_strength": "moderate",
        "emotional_complexity": 0.75,
        "language_patterns": ["stress indicators", "negative self-talk"],
        "risk_indicators": ["anxiety", "overwhelm"],
        "positive_indicators": []
      },
      "insights": {
        "primary_emotion": "anxiety",
        "secondary_emotions": ["stress", "overwhelm"],
        "emotional_trajectory": "declining",
        "intervention_suggestions": ["stress management", "coping strategies"],
        "support_recommendations": ["professional consultation", "relaxation techniques"]
      },
      "validation": {
        "vader_alignment": "high",
        "confidence_level": 0.85,
        "analysis_reliability": "high",
        "potential_biases": []
      },
      "clinical_notes": {
        "concern_level": "moderate",
        "follow_up_needed": true,
        "professional_referral": "counselor",
        "urgency_score": 0.6
      }
    },
    "confidence": 0.82,
    "alignment": {
      "category_match": "negative",
      "overall_alignment": "high",
      "confidence_delta": 0.05
    }
  },
  "enhancedMetadata": {
    "llmModel": "meta-llama/Llama-3.1-8B-Instruct",
    "analysisMode": "hybrid_vader_llm",
    "enhancedTimestamp": "2025-06-01T..."
  }
}
```

## 🚀 Usage Examples

### Basic Usage
```javascript
import sentimentService from './services/sentiment.service.js';

// Quick analysis
const result = await sentimentService.quickAnalyzeWithLLM("I'm feeling really anxious today");
console.log('VADER:', result.vader.sentiment, result.vader.score);
console.log('LLM:', result.llm.emotional_state, result.llm.concern_level);

// Comprehensive analysis
const detailed = await sentimentService.analyzeSentimentWithLLMInterpretation(
  "Sobrang lungkot ko ngayon",
  { enableTranslation: true }
);
```

### Batch Processing
```javascript
const texts = [
  "I'm having a great day!",
  "This is terrible, I can't handle it",
  "Everything is okay, I guess"
];

const results = await sentimentService.batchAnalyzeWithLLM(texts, { detailed: false });
```

## 🔒 Safety Features

### 1. Hallucination Prevention
- VADER scores provide objective baseline
- LLM interpretations are cross-validated against VADER
- Confidence scoring based on alignment
- Fallback to VADER-only when LLM fails

### 2. Error Handling
- Graceful degradation on LLM failures
- JSON parsing error recovery
- Network timeout handling
- Batch processing continues on individual failures

### 3. Clinical Safety
- Professional referral recommendations
- Risk indicator flagging
- Urgency scoring for crisis situations
- Conservative bias toward safety

## 🧪 Testing

Run the test suite:
```bash
cd backend
node test-llm-sentiment.js
```

This will test:
- Quick LLM analysis
- Comprehensive analysis
- Batch processing
- Error handling
- Translation support

## 📈 Benefits

1. **Reduced Hallucination**: VADER provides objective anchor points
2. **Enhanced Context**: LLM adds psychological and clinical insights
3. **Cultural Sensitivity**: Better handling of translated content
4. **Clinical Utility**: Professional-grade risk assessment
5. **Reliability**: Cross-validation and confidence scoring
6. **Scalability**: Efficient batch processing with fallback safety

## ⚙️ Configuration

The system uses the existing Hugging Face inference client with Llama 3.1-8B-Instruct model. Ensure your `.env` file contains:

```env
HF_SENTIBOT_TOKEN=your_huggingface_token
```

## 🔄 Migration

Existing code using `analyzeSentiment()` continues to work unchanged. The new LLM-enhanced methods are additive and don't break existing functionality.
