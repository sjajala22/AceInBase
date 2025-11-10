import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { getSystemPrompt } from '../constants';
import { Subject, Difficulty } from '../types';

let ai: GoogleGenAI | null = null;
// Fix: Updated API key retrieval to use `process.env.API_KEY` as required by the coding guidelines. This resolves the `import.meta.env` TypeScript error and aligns the error message.
try {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
} catch (error) {
  console.error("Failed to initialize GoogleGenAI. Make sure API_KEY is set in your environment.", error);
}

let activeChat: Chat | null = null;

export const startChatSession = (subject: Subject, difficulty: Difficulty, topic: string): Chat => {
  if (!ai) {
    throw new Error("GoogleGenAI is not initialized.");
  }
  
  const systemInstruction = getSystemPrompt(subject, difficulty, topic);

  activeChat = ai.chats.create({
    model: 'gemini-2.5-pro',
    config: {
      systemInstruction: systemInstruction,
    }
  });
  
  return activeChat;
};


export const sendMessageToAI = async (message: string): Promise<string> => {
  if (!activeChat) {
    throw new Error("Chat session not started. Call startChatSession first.");
  }
  try {
    const response: GenerateContentResponse = await activeChat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error sending message to AI:", error);
    return "Oops! I've run into a small problem. Could you try asking that again?";
  }
};

export const getReviewForConcepts = async (concepts: string[]): Promise<string> => {
    if (!ai) {
        throw new Error("GoogleGenAI is not initialized.");
    }
    
    // Fix: Corrected a typo in the prompt string.
    const reviewPrompt = `
You are "Ace," a friendly and super smart 8-year-old tutor. A student struggled with some questions and needs your help to understand the concepts better. Your goal is to provide simple, clear, and super encouraging explanations for the core ideas behind each question they got wrong.

**Your Task:**
For each of the questions listed below, explain the main concept in a way a Year 7 or 8 student can easily understand. Don't just give the answer, explain the *why* and *how*. Use fun analogies or simple examples if you can! And don't forget plenty of encouraging emojis! ✨

**Questions the student found tricky:**
${concepts.map(c => `- ${c.replace(/^Question \d{1,2}\/10: /, '')}`).join('\n')}

**Your Output Instructions:**
- Go through each concept one-by-one in the same order as the list above.
- Your explanation for each concept should sound like a friend helping them out. Start with something positive like "No worries, let's look at this one together! 🤔".
- **IMPORTANT**: Separate the complete explanation for each question with this exact delimiter on its own line:
---CONCEPT_BREAK---
- Do NOT add the delimiter after the final explanation.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: reviewPrompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error getting review from AI:", error);
        return "Oh no! I got a bit stuck trying to prepare your review. Maybe we can try again in a moment?";
    }
};
