import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Chat, GenerateContentStreamResult } from "@google/genai";
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { UploadedDocument, Message, LoadingState } from './types';
import { estimateTokens, readFileContent } from './utils/textUtils';
import { createChatSession, sendMessageStream } from './services/geminiService';

const App: React.FC = () => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  
  // Create or Recreate Chat Session whenever documents change
  useEffect(() => {
    const initChat = async () => {
      const session = await createChatSession(documents);
      setChatSession(session);
    };
    initChat();
  }, [documents]);

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList) return;

    const newDocs: UploadedDocument[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      try {
        const content = await readFileContent(file);
        newDocs.push({
          id: uuidv4(),
          name: file.name,
          content: content,
          type: file.type,
          size: file.size,
          tokens: estimateTokens(content),
        });
      } catch (error) {
        console.error("Failed to read file", file.name, error);
        alert(`Failed to read file: ${file.name}`);
      }
    }
    setDocuments(prev => [...prev, ...newDocs]);
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || !chatSession) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoadingState('loading');

    try {
      const result: GenerateContentStreamResult = await sendMessageStream(chatSession, userMessage.content);
      
      const botMessageId = uuidv4();
      let fullText = '';
      
      // Temporary message for streaming
      setMessages(prev => [...prev, {
        id: botMessageId,
        role: 'model',
        content: '',
        timestamp: Date.now(),
        isStreaming: true
      }]);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        
        // Update the last message with new content
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId 
            ? { 
                ...msg, 
                content: fullText, 
                // We might get grounding metadata in chunks or at end, usually available in response object
                // accessing deeply to check if grounding exists in this chunk
                groundingMetadata: chunk.candidates?.[0]?.groundingMetadata 
                  ? {
                      groundingChunks: chunk.candidates[0].groundingMetadata.groundingChunks
                    }
                  : msg.groundingMetadata
              } 
            : msg
        ));
      }

      setLoadingState('idle');
      // Final update to clear streaming flag
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId ? { ...msg, isStreaming: false } : msg
      ));

    } catch (error) {
      console.error("Error sending message:", error);
      setLoadingState('error');
      setMessages(prev => [...prev, {
        id: uuidv4(),
        role: 'model',
        content: "Sorry, I encountered an error while processing your request. Please check your API key and try again.",
        timestamp: Date.now(),
      }]);
    }
  }, [input, chatSession]);

  const totalTokens = documents.reduce((acc, doc) => acc + (doc.tokens || 0), 0);

  return (
    <div className="flex h-screen w-full bg-gray-950 text-white overflow-hidden font-sans selection:bg-blue-500/30">
      <Sidebar 
        documents={documents} 
        onUpload={handleUpload} 
        onRemoveDocument={removeDocument}
        totalTokens={totalTokens}
      />
      
      <main className="flex-1 flex flex-col h-full relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
           <h1 className="font-bold">Gemini Omni-RAG</h1>
           <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">{documents.length} Docs</span>
        </div>

        <ChatArea 
          messages={messages}
          input={input}
          setInput={setInput}
          onSend={handleSend}
          isLoading={loadingState === 'loading' || loadingState === 'streaming'}
          onStop={() => {}}
        />
      </main>
    </div>
  );
};

export default App;
