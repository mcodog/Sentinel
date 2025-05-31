import sentimentService from './services/sentiment.service.js';

// Test text with contractions
const testTexts = [
    "I don't feel good today",
    "Can't sleep, won't work",
    "I'm sad and you're not helping",
    "It's okay, we'll get through this",
    "I haven't been feeling well lately"
];

console.log('🧪 Testing Sentiment Analysis Word Tokenization Fix\n');

async function testTokenization() {
    for (const text of testTexts) {
        console.log(`\n📝 Original text: "${text}"`);
        
        try {
            const analysis = await sentimentService.analyzeSentiment(text);
            
            console.log('🔤 Words analyzed:');
            analysis.wordAnalysis.words.forEach((wordData, index) => {
                console.log(`  ${index + 1}. "${wordData.word}" (sentiment: ${wordData.sentiment.category})`);
            });
            
            console.log(`📊 Overall sentiment: ${analysis.overall.category} (${analysis.overall.compound.toFixed(3)})`);
            
        } catch (error) {
            console.error(`❌ Error analyzing "${text}":`, error.message);
        }
    }
}

testTokenization().then(() => {
    console.log('\n✅ Tokenization test completed!');
    process.exit(0);
}).catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});
