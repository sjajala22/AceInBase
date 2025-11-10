import React, { useState, useCallback } from 'react';
import { Subject } from './types';
import SubjectSelector from './components/SubjectSelector';
import GameScreen from './components/GameScreen';
import Dashboard from './components/Dashboard';
import SparklesIcon from './components/icons/SparklesIcon';
import ChartIcon from './components/icons/ChartIcon';

const App: React.FC = () => {
  const [view, setView] = useState<'selector' | 'game' | 'dashboard'>('selector');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const handleSubjectSelect = useCallback((subject: Subject) => {
    setSelectedSubject(subject);
    setView('game');
  }, []);

  const handleBackToMenu = useCallback(() => {
    setSelectedSubject(null);
    setView('selector');
  }, []);

  const renderContent = () => {
    switch (view) {
      case 'game':
        return <GameScreen subject={selectedSubject!} onBack={handleBackToMenu} />;
      case 'dashboard':
        return <Dashboard onBack={handleBackToMenu} />;
      case 'selector':
      default:
        return <SubjectSelector onSelect={handleSubjectSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      <header className="w-full p-4 flex items-center justify-between border-b border-slate-700 shadow-lg bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div 
          className="flex items-center cursor-pointer"
          onClick={handleBackToMenu}
          aria-label="Back to home"
        >
          <SparklesIcon className="w-8 h-8 text-cyan-400 mr-3" />
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">
            AceInBase
          </h1>
        </div>
        <button
          onClick={() => setView('dashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm font-medium"
        >
          <ChartIcon className="w-5 h-5"/>
          Dashboard
        </button>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
