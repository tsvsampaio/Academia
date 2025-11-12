import React, { useState, useEffect, useMemo } from 'react';
import { WorkoutHistoryEntry, WorkoutDay, Exercise } from '../types';

interface WorkoutHistoryProps {
  onBack: () => void;
}

const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({ onBack }) => {
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([]);
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('workoutHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Erro ao carregar histórico do localStorage", e);
    }
  }, []);

  const filteredAndSortedHistory = useMemo(() => {
    return history
      .filter(item => 
        item.planName.toLowerCase().includes(filter.toLowerCase()) ||
        item.workoutDay.foco.toLowerCase().includes(filter.toLowerCase()) ||
        item.feedback.toLowerCase().includes(filter.toLowerCase())
      )
      .sort((a, b) => {
        const dateA = new Date(a.completedAt).getTime();
        const dateB = new Date(b.completedAt).getTime();
        return sortOrder === 'recent' ? dateB - dateA : dateA - dateB;
      });
  }, [history, sortOrder, filter]);

  return (
    <div className="w-full max-w-4xl animate-fade-in">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white">
          Histórico de Treinos
        </h2>
        <button
          onClick={onBack}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <ArrowLeftIcon />
          Voltar
        </button>
      </div>

      {history.length === 0 ? (
        <div className="text-center bg-gray-800/60 p-10 rounded-xl">
          <p className="text-xl text-gray-400">Nenhum treino concluído ainda.</p>
          <p className="text-gray-500 mt-2">Finalize um dia de treino para vê-lo aqui!</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-800/60 rounded-xl border border-gray-700">
            <input
              type="text"
              placeholder="Filtrar por nome, foco ou feedback..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full md:flex-1 bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
            />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'recent' | 'oldest')}
              className="w-full md:w-auto bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
            >
              <option value="recent">Mais Recentes</option>
              <option value="oldest">Mais Antigos</option>
            </select>
          </div>
          
          <div className="space-y-4">
            {filteredAndSortedHistory.map(item => (
              <HistoryCard key={item.id} item={item} />
            ))}
            {filteredAndSortedHistory.length === 0 && (
                <div className="text-center p-10">
                    <p className="text-lg text-gray-400">Nenhum resultado encontrado para sua busca.</p>
                </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const HistoryCard: React.FC<{ item: WorkoutHistoryEntry }> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-xl transition-all duration-300">
      <div 
        className="p-5 flex justify-between items-start cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls={`history-details-${item.id}`}
      >
        <div className="flex-1 pr-4">
          <p className="text-xs text-gray-400">{new Date(item.completedAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          <h3 className="text-xl font-bold text-white mt-1">{item.planName}</h3>
          <p className="text-cyan-400 font-semibold">{item.workoutDay.foco}</p>
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          <div className="bg-gray-700/50 rounded-md px-3 py-1 text-center">
            <p className="text-sm font-medium text-gray-300 italic">"{item.feedback}"</p>
          </div>
        </div>
         <ChevronDownIcon className={`w-6 h-6 text-gray-400 transition-transform duration-300 flex-shrink-0 ml-4 ${isExpanded ? 'transform rotate-180' : ''}`} />
      </div>

      <div
        id={`history-details-${item.id}`}
        className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-5 pb-5 pt-4 border-t border-gray-700 space-y-6">
          <WorkoutSection title="Aquecimento" content={item.workoutDay.aquecimento} icon={<FireIcon />} />
          
          <div>
            <h4 className="text-lg font-semibold text-gray-200 mb-3 flex items-center">
              <DumbbellIcon className="w-5 h-5 mr-2 text-cyan-400" />
              Treino Principal
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="p-3 text-sm font-semibold tracking-wide text-gray-300">Exercício</th>
                    <th className="p-3 text-sm font-semibold tracking-wide text-gray-300 text-center">Séries</th>
                    <th className="p-3 text-sm font-semibold tracking-wide text-gray-300 text-center">Reps</th>
                    <th className="p-3 text-sm font-semibold tracking-wide text-gray-300 text-center">Descanso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {item.workoutDay.exercicios.map((ex, i) => (
                      <tr key={i} className="bg-gray-800 hover:bg-gray-700/50 transition-colors">
                        <td className="p-3">
                          <p className="font-bold text-white">{ex.nome}</p>
                          {ex.observacoes && <p className="text-xs text-gray-400">{ex.observacoes}</p>}
                        </td>
                        <td className="p-3 text-center text-gray-300">{ex.series}</td>
                        <td className="p-3 text-center text-gray-300">{ex.repeticoes}</td>
                        <td className="p-3 text-center text-gray-300">{ex.descanso}</td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <WorkoutSection title="Resfriamento" content={item.workoutDay.resfriamento} icon={<SnowflakeIcon />} />
        </div>
      </div>
    </div>
  );
};


const WorkoutSection: React.FC<{ title: string, content: string, icon: React.ReactNode }> = ({ title, content, icon }) => (
  <div>
    <h4 className="text-lg font-semibold text-gray-200 mb-2 flex items-center">
      <div className="w-5 h-5 mr-2 text-cyan-400">{icon}</div>
      {title}
    </h4>
    <p className="text-gray-400 pl-7">{content}</p>
  </div>
);


const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);
const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);
const FireIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 3.75 3.75 0 0 0-7.49 0a3.75 3.75 0 0 0 5.25 6.245 3.75 3.75 0 0 0 .255-1.025S12 10.5 12 10.5a3.75 3.75 0 0 0 0 7.5Z" /></svg>;
const DumbbellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.25A2.25 2.25 0 0018.75 11H17V8.75A2.25 2.25 0 0014.75 6.5h-1.5a2.25 2.25 0 00-2.25 2.25V11H7a2.25 2.25 0 00-2.25 2.25v0A2.25 2.25 0 007 15.5h4v2.25A2.25 2.25 0 0013.25 20h1.5a2.25 2.25 0 002.25-2.25V15.5h1.75A2.25 2.25 0 0021 13.25zM7 11V8.75A2.25 2.25 0 019.25 6.5h0A2.25 2.25 0 0111.5 8.75V11m-4.5 4.5v2.25A2.25 2.25 0 009.25 20h0a2.25 2.25 0 002.25-2.25V15.5" />
  </svg>
);
const SnowflakeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15m4.243-5.257L6.75 14.243m10.5-7.486L9.757 16.243" /></svg>;

export default WorkoutHistory;