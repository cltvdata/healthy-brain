import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import { User, Bot } from 'lucide-react';
import { SourceChips } from './SourceChips';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-gradient-to-br from-bio-orange to-red-500 shadow-md shadow-bio-orange/20' 
            : 'bg-gradient-to-br from-neuro-blue to-bio-green shadow-md shadow-neuro-blue/20'
        }`}>
          {isUser ? <User className="w-4.5 h-4.5 text-black stroke-[3]" /> : <Bot className="w-4.5 h-4.5 text-black stroke-[3]" />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col p-4 rounded-3xl backdrop-blur-md border ${
          isUser 
            ? 'bg-bio-orange/15 border-bio-orange/30 text-white rounded-tr-none' 
            : 'bg-glass-noir border-white/10 text-gray-100 rounded-tl-none'
        }`}>
          {message.isLoading ? (
            <div className="flex items-center space-x-2 h-6 px-1">
              <div className="w-2 h-2 bg-neuro-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-bio-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-bio-orange rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          ) : (
            <>
              <div className={`prose prose-sm max-w-none prose-invert font-medium text-xs leading-relaxed`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
              {!isUser && <SourceChips metadata={message.groundingMetadata} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};