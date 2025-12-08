import React, { useEffect, useRef } from 'react';
import { Send, Bot, User, Globe, Loader2, StopCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';

interface ChatAreaProps {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  onStop: () => void; // Placeholder for stop functionality if implemented
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, input, setInput, onSend, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // Adjust textarea height
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-950 relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 select-none">
            <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-6 border border-gray-800">
               <Bot className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-200 mb-2">How can I help you today?</h2>
            <p className="text-gray-500 max-w-md">
              Upload documents to the sidebar to ask questions about your data, or just start chatting to use Google Search grounding.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'justify-end' : ''}`}>
              
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0 mt-1 border border-blue-500/30">
                  <Bot className="w-5 h-5 text-blue-400" />
                </div>
              )}

              <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`
                    px-5 py-3.5 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed
                    ${msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-sm' 
                      : 'bg-gray-800/80 text-gray-100 border border-gray-700/50 rounded-bl-sm'}
                  `}
                >
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <div className="markdown-content">
                       <ReactMarkdown 
                        components={{
                          a: ({node, ...props}) => <a {...props} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" />,
                          code: ({node, className, children, ...props}) => {
                             const match = /language-(\w+)/.exec(className || '')
                             return match ? (
                               <div className="relative my-4 rounded-md overflow-hidden bg-gray-950 border border-gray-800">
                                 <div className="flex items-center justify-between px-4 py-1.5 bg-gray-900 border-b border-gray-800 text-xs text-gray-400 font-mono">
                                    <span>{match[1]}</span>
                                 </div>
                                 <code className={`block p-4 overflow-x-auto ${className}`} {...props}>
                                   {children}
                                 </code>
                               </div>
                             ) : (
                               <code className="bg-gray-900 px-1.5 py-0.5 rounded text-blue-300 font-mono text-sm" {...props}>
                                 {children}
                               </code>
                             )
                          }
                        }}
                       >
                         {msg.content}
                       </ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* Grounding / Sources */}
                {msg.groundingMetadata?.groundingChunks && msg.groundingMetadata.groundingChunks.length > 0 && (
                   <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                      {msg.groundingMetadata.groundingChunks.map((chunk, idx) => (
                        chunk.web && (
                          <a 
                            key={idx} 
                            href={chunk.web.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 bg-gray-900/50 border border-gray-800 hover:border-blue-500/50 rounded-lg transition-colors group"
                          >
                            <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center flex-shrink-0 text-gray-400 group-hover:text-blue-400">
                              <Globe className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                               <p className="text-xs font-medium text-gray-300 truncate group-hover:text-blue-300">{chunk.web.title}</p>
                               <p className="text-[10px] text-gray-500 truncate">{new URL(chunk.web.uri).hostname}</p>
                            </div>
                          </a>
                        )
                      ))}
                   </div>
                )}
              </div>

               {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-5 h-5 text-gray-300" />
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && (
           <div className="flex gap-4 max-w-4xl mx-auto">
             <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                  <Bot className="w-5 h-5 text-blue-400" />
             </div>
             <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
             </div>
           </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900/80 border-t border-gray-800 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto relative">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your documents or the web..."
            className="w-full bg-gray-800 text-gray-100 placeholder-gray-500 rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-gray-800 transition-all resize-none shadow-lg border border-gray-700"
            style={{ minHeight: '52px' }}
          />
          <button
            onClick={onSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 bottom-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-white transition-all shadow-md"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-600 mt-2">
           Gemini may display inaccurate info, including about people, so double-check its responses.
        </p>
      </div>
    </div>
  );
};

export default ChatArea;
