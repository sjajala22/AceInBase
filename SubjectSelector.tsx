
import React from 'react';
import { Subject } from '../types';
import MathsIcon from './icons/MathsIcon';
import ScienceIcon from './icons/ScienceIcon';

interface SubjectSelectorProps {
  onSelect: (subject: Subject) => void;
}

const SubjectCard: React.FC<{
  subject: Subject;
  icon: React.ReactNode;
  color: string;
  onClick: (subject: Subject) => void;
}> = ({ subject, icon, color, onClick }) => (
  <button
    onClick={() => onClick(subject)}
    className={`group relative w-full md:w-64 h-80 rounded-xl p-6 flex flex-col justify-between items-center bg-slate-800 border border-slate-700 hover:border-${color}-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-${color}-500/20`}
  >
    <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br from-${color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`}></div>
    <div className="relative z-10 text-center">
      <div className={`mx-auto mb-4 w-24 h-24 flex items-center justify-center rounded-full bg-slate-900 border-2 border-slate-700 group-hover:border-${color}-500 transition-all duration-300`}>
        {icon}
      </div>
      <h2 className="text-3xl font-bold text-slate-100">{subject}</h2>
      <p className="text-slate-400 mt-2">Begin your learning adventure!</p>
    </div>
    <span className={`relative z-10 px-6 py-2 rounded-full text-lg font-semibold bg-${color}-500 text-white shadow-lg shadow-${color}-500/30`}>
      Start
    </span>
  </button>
);


const SubjectSelector: React.FC<SubjectSelectorProps> = ({ onSelect }) => {
  // Dummy elements to make Tailwind JIT compiler include these classes
  // The actual colors are applied via template literals which JIT might miss
  const dummy = "hover:border-cyan-500 hover:shadow-cyan-500/20 bg-gradient-to-br from-cyan-500/10 bg-cyan-500 shadow-cyan-500/30 hover:border-violet-500 hover:shadow-violet-500/20 bg-gradient-to-br from-violet-500/10 bg-violet-500 shadow-violet-500/30";

  return (
    <div className="text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-100">Welcome to AceInBase!</h1>
      <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
        Choose a subject to start your personalized learning journey and become an ace!
      </p>
      <div className="flex flex-col md:flex-row gap-8">
        <SubjectCard 
          subject={Subject.Maths}
          icon={<MathsIcon className="w-12 h-12 text-cyan-400" />}
          color="cyan"
          onClick={onSelect}
        />
        <SubjectCard 
          subject={Subject.Science}
          icon={<ScienceIcon className="w-12 h-12 text-violet-400" />}
          color="violet"
          onClick={onSelect}
        />
      </div>
    </div>
  );
};

export default SubjectSelector;
