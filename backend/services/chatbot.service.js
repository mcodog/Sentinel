import { pipeline } from "@huggingface/transformers";

const MODEL = "xformai/qwen-0.6b-mentalhealth-support";
// const MODEL = 'tanusrich/Mental_Health_Chatbot'
class ChatAssistant {
  /**
   * Constructor for ChatAssistant.
   * @param {Object} pipe - The loaded pipeline.
   */
  constructor(pipe) {
    this.pipeline = pipe;
  }

  /**
   * Generates a response based on the provided messages.
   * @param {Array} messages - List of messages with roles (e.g., "system", "user").
   * @returns {string} The generated text from the assistant.
   */
  async generateResponse(messages) {
    try {
      const output = await this.pipeline(messages, {
        max_new_tokens: 150,
        temperature: 0.7,
        top_p: 0.9,
      });
      return output[0].generated_text;
    } catch (error) {
      console.error("Error generating response:", error);
      throw new Error("Failed to generate response");
    }
  }

  /**
   * Creates an instance of ChatAssistant by loading the pipeline.
   * @returns {ChatAssistant} An instance of ChatAssistant.
   */
  static async create() {
    try {
      const pipe = await pipeline("text-generation", MODEL);
      return new ChatAssistant(pipe);
    } catch (error) {
      console.error("Error loading pipeline:", error);
      throw new Error("Failed to load model");
    }
  }
}

export default ChatAssistant;
