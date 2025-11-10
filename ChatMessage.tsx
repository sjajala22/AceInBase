
import React from 'react';
import { Message, Role } from '../types';
import SparklesIcon from './icons/SparklesIcon';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === Role.Model;
  
  // Check if the message is a question from the model
  const isQuestion = isModel && /^Question\s\d{1,2}\/10:/.test(message.text);

  const containerClasses = isModel
    ? 'flex items-start gap-3 self-start'
    : 'flex items-start gap-3 self-end flex-row-reverse';
  
  const bubbleClasses = isModel
    ? isQuestion
      ? 'bg-slate-600 text-slate-100 rounded-r-xl rounded-bl-xl border border-cyan-500/50 shadow-lg'
      : 'bg-slate-700 text-slate-200 rounded-r-xl rounded-bl-xl'
    : 'bg-violet-600 text-white rounded-l-xl rounded-br-xl';
  
  const avatar = isModel ? (
    <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
      <SparklesIcon className="w-5 h-5 text-white"/>
    </div>
  ) : (
     <div className="w-8 h-8 rounded-full flex-shrink-0 bg-slate-600 flex items-center justify-center font-bold">
      U
    </div>
  );

  return (
    <div className={containerClasses}>
      {avatar}
      <div className={`px-4 py-3 max-w-md md:max-w-lg ${bubbleClasses}`}>
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;