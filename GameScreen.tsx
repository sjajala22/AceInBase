import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Subject, Message, Role, Difficulty } from '../types';
import { startChatSession, sendMessageToAI, getReviewForConcepts } from '../services/geminiService';
import { saveQuizResult } from '../services/progressService';
import { MATHS_TOPICS, SCIENCE_TOPICS } from '../constants';
import ChatMessage from './ChatMessage';
import UserInput from './UserInput';

interface GameScreenProps {
  subject: Subject;
  onBack: () => void;
}

const UIButton: React.FC<{
  text: string;
  onClick: () => void;
  color: string;
  className?: string;
}> = ({ text, onClick, color, className = '' }) => (
  <button
    onClick={onClick}
    className={`w-full md:w-56 py-4 px-6 rounded-lg text-xl font-bold text-white transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-2xl bg-${color}-600 hover:bg-${color}-500 border-b-4 border-${color}-800 hover:border-${color}-700 ${className}`}
  >
    {text}
  </button>
);


const GameScreen: React.FC<GameScreenProps> = ({ subject, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [quizState, setQuizState] = useState<'selecting-difficulty' | 'selecting-topic' | 'active' | 'finished' | 'reviewing'>('selecting-difficulty');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [incorrectAnswers, setIncorrectAnswers] = useState<string[]>([]);
  const [reviewContent, setReviewContent] = useState<string[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleDifficultySelect = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    setQuizState('selecting-topic');
  }

  const startQuiz = useCallback(async (topic: string) => {
    if (!selectedDifficulty) return;
    setSelectedTopic(topic);
    setQuizState('active');
    setIsLoading(true);
    setMessages([]);
    setScore(0);
    setIncorrectAnswers([]);
    try {
      startChatSession(subject, selectedDifficulty, topic);
      const initialResponse = await sendMessageToAI(`I'm ready to start the ${selectedDifficulty} ${subject} quiz on ${topic}.`);
      setMessages([{ role: Role.Model, text: initialResponse }]);
    } catch (error) {
      console.error("Failed to initialize chat:", error);
      setMessages([{ role: Role.Model, text: "Sorry, I couldn't start the quiz. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  }, [subject, selectedDifficulty]);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (quizState === 'reviewing' && incorrectAnswers.length > 0) {
      const fetchReview = async () => {
        setIsLoading(true);
        setReviewContent([]);
        try {
          const review = await getReviewForConcepts(incorrectAnswers);
          setReviewContent(review.split('---CONCEPT_BREAK---'));
        } catch (error) {
          console.error("Failed to get review:", error);
          setReviewContent(["Oops! I couldn't get the review for your mistakes. Please try again later."]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchReview();
    }
  }, [quizState, incorrectAnswers]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading || !selectedDifficulty || !selectedTopic) return;

    const userMessage: Message = { role: Role.User, text };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const aiResponseText = await sendMessageToAI(text);
      
      const scoreRegex = /\[TOTAL_SCORE:\s*(\d+)]/;
      const scoreMatch = aiResponseText.match(scoreRegex);
      let cleanText = aiResponseText;

      if (scoreMatch && scoreMatch[1]) {
        const newScore = parseInt(scoreMatch[1], 10);
        setScore(newScore);
        cleanText = aiResponseText.replace(scoreRegex, '').trim();
      } else if (!aiResponseText.includes('[QUIZ_COMPLETE]')) {
        // Incorrect answer. Find the last question asked.
        const lastQuestion = [...messages].reverse().find(m => m.role === Role.Model && m.text.startsWith('Question'))?.text;
        if (lastQuestion) {
          setIncorrectAnswers(prev => {
            if (!prev.includes(lastQuestion)) {
              return [...prev, lastQuestion];
            }
            return prev;
          });
        }
      }
      
      if (aiResponseText.includes('[QUIZ_COMPLETE]')) {
        setQuizState('finished');
        cleanText = aiResponseText.replace('[QUIZ_COMPLETE]', '').trim();
        const finalScore = scoreMatch ? parseInt(scoreMatch[1], 10) : score;
        saveQuizResult(subject, selectedDifficulty, selectedTopic, finalScore);
      }

      const aiMessage: Message = { role: Role.Model, text: cleanText };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage: Message = { role: Role.Model, text: "I'm having a little trouble thinking. Can you repeat that?" };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, score, subject, selectedDifficulty, selectedTopic, messages]);

  const renderContent = () => {
    if (quizState === 'selecting-difficulty') {
      const dummyColors = "bg-green-600 hover:bg-green-500 border-green-800 hover:border-green-700 bg-yellow-600 hover:bg-yellow-500 border-yellow-800 hover:border-yellow-700 bg-red-600 hover:bg-red-500 border-red-800 hover:border-red-700";
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <h2 className="text-4xl font-extrabold mb-4">Choose Your Challenge!</h2>
          <p className="text-slate-400 mb-8">Select a difficulty to begin the quiz.</p>
          <div className="flex flex-col md:flex-row gap-6">
            <UIButton text={Difficulty.Simple} onClick={() => handleDifficultySelect(Difficulty.Simple)} color="green" />
            <UIButton text={Difficulty.Medium} onClick={() => handleDifficultySelect(Difficulty.Medium)} color="yellow" />
            <UIButton text={Difficulty.Advanced} onClick={() => handleDifficultySelect(Difficulty.Advanced)} color="red" />
          </div>
        </div>
      );
    }

    if (quizState === 'selecting-topic') {
      const topics = subject === Subject.Maths ? MATHS_TOPICS : SCIENCE_TOPICS;
      return (
         <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <h2 className="text-4xl font-extrabold mb-4">Select a Topic</h2>
          <p className="text-slate-400 mb-8">What would you like to be quizzed on?</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {topics.map(topic => (
              <button
                key={topic}
                onClick={() => startQuiz(topic)}
                className="py-3 px-4 rounded-lg text-lg font-semibold text-white transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-lg bg-slate-700 hover:bg-slate-600"
              >
                {topic}
              </button>
            ))}
          </div>
         </div>
      )
    }

    if (quizState === 'reviewing') {
      return (
        <div className="p-6 flex-grow overflow-y-auto custom-scrollbar">
          <h2 className="text-3xl font-bold mb-4 text-amber-400">Let's Review! ✨</h2>
          <p className="text-slate-400 mb-6">Here are some simple explanations for the topics you found tricky.</p>
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-slate-300 animate-pulse">Ace is thinking up some helpful explanations...</p>
            </div>
          ) : (
             <div className="space-y-4">
              {incorrectAnswers.map((question, index) => (
                <div key={index} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                  <p className="font-semibold text-slate-300 mb-2">You had trouble with:</p>
                  <p className="italic text-slate-400 mb-3 pl-2 border-l-2 border-slate-600">{question.replace(/^Question \d{1,2}\/10: /, '')}</p>
                  <p className="font-semibold text-cyan-400 mb-2">Ace explains:</p>
                  <div className="whitespace-pre-wrap text-slate-200">
                    {reviewContent[index] || "Loading explanation..."}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-8 text-center">
            <button 
                onClick={() => setQuizState('finished')} 
                className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors font-semibold text-lg"
            >
                Back to Results
            </button>
          </div>
        </div>
      );
    }
    
    if (quizState === 'finished') {
      return (
         <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-4">Quiz Complete!</h2>
          <p className="text-2xl text-slate-300 mb-2">Your final score is:</p>
          <p className="text-7xl font-bold text-white mb-8">{score}</p>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
             <button onClick={() => {
               setQuizState('selecting-difficulty');
               setSelectedDifficulty(null);
               setSelectedTopic(null);
             }} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors font-semibold text-lg">
                Play Again
             </button>
             <button onClick={onBack} className="px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors font-semibold text-lg">
                Change Subject
             </button>
             {incorrectAnswers.length > 0 && (
                <button
                    onClick={() => setQuizState('reviewing')}
                    className="px-8 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors font-semibold text-lg"
                >
                    Review Mistakes ({incorrectAnswers.length})
                </button>
             )}
          </div>
        </div>
      )
    }

    return (
      <>
        <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-4">
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 self-start ml-11 mt-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-0"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-200"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-400"></div>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 border-t border-slate-700">
          <UserInput onSend={handleSendMessage} isLoading={isLoading} />
        </div>
      </>
    );
  };
  
  return (
    <div className="w-full max-w-3xl h-[80vh] flex flex-col bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
      {quizState === 'active' || quizState === 'finished' || quizState === 'reviewing' ? (
         <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <button onClick={onBack} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm font-medium">
            &larr; Change Subject
          </button>
          <div className="text-center">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">{subject} Challenge</h2>
            <p className="text-sm text-slate-400">{selectedTopic}</p>
          </div>
          <div className="w-28 text-right font-bold text-lg text-amber-400">
            Score: {score}
          </div>
        </div>
      ) : null}
      {renderContent()}
    </div>
  );
};

export default GameScreen;