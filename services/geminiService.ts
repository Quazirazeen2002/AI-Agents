import { GoogleGenAI, Chat, GenerateContentStreamResult } from "@google/genai";
import { UploadedDocument } from "../types";

// Initialize Gemini Client
// NOTE: We assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_NAME = 'gemini-2.5-flash';

export const createChatSession = async (
  documents: UploadedDocument[],
  systemPromptAddon: string = ""
): Promise<Chat> => {
  
  // Construct the Knowledge Base from documents
  let knowledgeBase = "";
  if (documents.length > 0) {
    knowledgeBase = `
You have access to the following Knowledge Base consisting of uploaded user documents. 
Always prioritize information found in this Knowledge Base when answering user questions.
If the answer is found in the Knowledge Base, cite the document name.

--- BEGIN KNOWLEDGE BASE ---
${documents.map(doc => `
[Document: ${doc.name}]
${doc.content}
------------------------
`).join('\n')}
--- END KNOWLEDGE BASE ---
`;
  }

  const systemInstruction = `
You are an intelligent RAG (Retrieval-Augmented Generation) assistant. 
Your goal is to provide accurate, helpful answers based on the provided Knowledge Base and your general knowledge.
${knowledgeBase}
${systemPromptAddon}

Rules:
1. Be concise and professional.
2. If using the Search Tool, always provide the source links.
3. If the answer is in the Knowledge Base, explicitly mention which document it came from.
`;

  const chat = ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
      maxOutputTokens: 8192,
      tools: [{ googleSearch: {} }] // Enable Search Grounding by default for "Omni" capability
    },
  });

  return chat;
};

export const sendMessageStream = async (
  chat: Chat,
  message: string
): Promise<GenerateContentStreamResult> => {
  return await chat.sendMessageStream({ message });
};
