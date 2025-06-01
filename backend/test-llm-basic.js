import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

console.log("Testing basic LLM connection...");
console.log("Token available:", !!process.env.HF_SENTIBOT_TOKEN);

const client = new InferenceClient(process.env.HF_SENTIBOT_TOKEN);
const PROVIDER = "fireworks-ai";
const MODEL = "meta-llama/Llama-3.1-8B-Instruct";

async function testBasicLLM() {
    try {
        console.log("Making test LLM call...");

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('LLM request timeout')), 10000)
        );

        const llmPromise = client.chatCompletion({
            provider: PROVIDER,
            model: MODEL,
            messages: [
                {
                    role: "user",
                    content: "Say 'Hello' in JSON format: {\"message\": \"Hello\"}"
                }
            ],
            parameters: {
                max_tokens: 50,
                temperature: 0.1
            }
        });

        const result = await Promise.race([llmPromise, timeoutPromise]);
        console.log("✅ LLM Response:", result.choices[0].message.content);

    } catch (error) {
        console.error("❌ LLM Test Failed:", error.message);
    }
}

testBasicLLM();
