import React, { useState, useEffect } from 'react';
import { getProgress, clearProgress } from '../services/progressService';
import { ProgressData, Subject, QuizAttempt } from '../types';
import MathsIcon from './icons/MathsIcon';
import ScienceIcon from './icons/ScienceIcon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SubjectTab: React.FC<{
  subject: Subject;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ subject, icon, isActive, onClick }) => {
  const activeClasses = 'bg-slate-700 border-cyan-400 text-white';
  const inactiveClasses = 'bg-slate-800 border-transparent text-slate-400 hover:bg-slate-700';
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-t-lg border-b-2 font-semibold transition-colors ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span>{subject}</span>
    </button>
  );
};

const Dashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [progress, setProgress] = useState<ProgressData>({ [Subject.Maths]: [], [Subject.Science]: [] });
  const [activeTab, setActiveTab] = useState<Subject>(Subject.Maths);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const handleClearProgress = () => {
    if (window.confirm("Are you sure you want to delete all your progress? This action cannot be undone.")) {
        clearProgress();
        setProgress({ [Subject.Maths]: [], [Subject.Science]: [] });
    }
  };

  const attempts = progress[activeTab];
  
  const averageScore = attempts.length > 0
    ? (attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length).toFixed(0)
    : 0;

  const chartData = attempts.map((attempt, index) => ({
    name: `Quiz #${index + 1}`,
    score: attempt.score,
    topic: attempt.topic,
  }));

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-slate-800 border border-slate-600 rounded-md shadow-lg">
          <p className="label font-bold text-slate-200">{`${label}`}</p>
          <p className="intro text-amber-400">{`Score : ${payload[0].value}`}</p>
          <p className="desc text-slate-400">{`Topic: ${payload[0].payload.topic}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-4xl h-[85vh] flex flex-col bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Progress Dashboard</h1>
        <button onClick={onBack} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm font-medium">
          &larr; Back to Menu
        </button>
      </div>

      <div className="flex">
        <SubjectTab subject={Subject.Maths} icon={<MathsIcon className="w-6 h-6"/>} isActive={activeTab === Subject.Maths} onClick={() => setActiveTab(Subject.Maths)} />
        <SubjectTab subject={Subject.Science} icon={<ScienceIcon className="w-6 h-6"/>} isActive={activeTab === Subject.Science} onClick={() => setActiveTab(Subject.Science)} />
      </div>

      <div className="bg-slate-900/50 p-6 rounded-b-lg flex-grow overflow-y-auto custom-scrollbar">
        {attempts.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-slate-300">No quizzes completed yet!</h3>
            <p className="text-slate-500 mt-2">Complete a quiz to see your progress here.</p>
          </div>
        ) : (
          <>
            <div className="bg-slate-800 p-4 rounded-lg mb-6 flex justify-around text-center">
                <div>
                    <p className="text-sm text-slate-400">Quizzes Taken</p>
                    <p className="text-3xl font-bold">{attempts.length}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-400">Average Score</p>
                    <p className="text-3xl font-bold text-amber-400">{averageScore}%</p>
                </div>
            </div>

            <h3 className="text-xl font-semibold mb-4 text-slate-200">Score Progression</h3>
            <div className="h-64 mb-8">
              {attempts.length < 2 ? (
                <div className="flex items-center justify-center h-full bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400">Complete one more quiz to see your progress chart.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <h3 className="text-xl font-semibold mb-4 text-slate-200">Quiz History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-700 text-sm text-slate-400">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Topic</th>
                    <th className="p-3">Difficulty</th>
                    <th className="p-3 text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.slice().reverse().map((attempt, index) => (
                    <tr key={index} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="p-3">{new Date(attempt.date).toLocaleDateString()}</td>
                      <td className="p-3">{attempt.topic}</td>
                      <td className="p-3">{attempt.difficulty}</td>
                      <td className="p-3 text-right font-bold text-amber-400">
                         <div className="flex items-center justify-end gap-2">
                           <span>{attempt.score}</span>
                           <span className={`w-3 h-3 rounded-full ${getScoreColor(attempt.score)}`}></span>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
       { (progress.Maths.length > 0 || progress.Science.length > 0) &&
         <div className="mt-6 text-center">
            <button onClick={handleClearProgress} className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium">
              Clear All Progress
            </button>
         </div>
       }
    </div>
  );
};

export default Dashboard;