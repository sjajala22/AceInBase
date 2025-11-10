
import React, { useState } from 'react';
import SendIcon from './icons/SendIcon';

interface UserInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

const UserInput: React.FC<UserInputProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Explain your thinking here..."
        disabled={isLoading}
        className="flex-grow bg-slate-900 border border-slate-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-200 text-slate-100 disabled:opacity-50"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={isLoading || !text.trim()}
        className="bg-violet-600 text-white p-3 rounded-lg hover:bg-violet-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0"
      >
        <SendIcon className="w-6 h-6" />
      </button>
    </form>
  );
};

export default UserInput;
