
import React from 'react';

interface HeaderProps {
  onShowHistory: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowHistory }) => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <DumbbellIcon className="w-8 h-8 text-cyan-400 mr-3" />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Gerador de Treinos com <span className="text-cyan-400">IA</span>
          </h1>
        </div>
        <button
          onClick={onShowHistory}
          className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm flex items-center gap-2"
        >
          <HistoryIcon />
          Histórico
        </button>
      </div>
    </header>
  );
};

const DumbbellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.25A2.25 2.25 0 0018.75 11H17V8.75A2.25 2.25 0 0014.75 6.5h-1.5a2.25 2.25 0 00-2.25 2.25V11H7a2.25 2.25 0 00-2.25 2.25v0A2.25 2.25 0 007 15.5h4v2.25A2.25 2.25 0 0013.25 20h1.5a2.25 2.25 0 002.25-2.25V15.5h1.75A2.25 2.25 0 0021 13.25zM7 11V8.75A2.25 2.25 0 019.25 6.5h0A2.25 2.25 0 0111.5 8.75V11m-4.5 4.5v2.25A2.25 2.25 0 009.25 20h0a2.25 2.25 0 002.25-2.25V15.5" />
  </svg>
);

const HistoryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


export default Header;