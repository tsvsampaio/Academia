import React, { useState } from 'react';
import { WorkoutPlan, WorkoutDay, Exercise, WorkoutHistoryEntry } from '../types';

// Declara a variável global jspdf injetada pelo script da CDN
declare const jspdf: any;

interface WorkoutDisplayProps {
  plan: WorkoutPlan;
  onReset: () => void;
}

type FeedbackState = { [dayId: string]: string };

const WorkoutDisplay: React.FC<WorkoutDisplayProps> = ({ plan, onReset }) => {
  const [dailyFeedback, setDailyFeedback] = useState<FeedbackState>(() => {
    try {
      const savedFeedback = localStorage.getItem(`feedback-${plan.nomeDoPlano}`);
      return savedFeedback ? JSON.parse(savedFeedback) : {};
    } catch (e) {
      console.error("Erro ao carregar feedback do localStorage", e);
      return {};
    }
  });

  const handleDayComplete = (day: WorkoutDay, feedback: string) => {
    // 1. Atualiza o estado local para a UI da visualização atual
    const newFeedbackState = { ...dailyFeedback, [day.dia]: feedback };
    setDailyFeedback(newFeedbackState);

    // 2. Salva o feedback específico do plano para persistência imediata na UI
    try {
      localStorage.setItem(`feedback-${plan.nomeDoPlano}`, JSON.stringify(newFeedbackState));
    } catch (e) {
      console.error("Erro ao salvar feedback no localStorage", e);
    }

    // 3. Salva no histórico global
    try {
      const historyEntry: WorkoutHistoryEntry = {
        id: `${plan.nomeDoPlano}-${day.dia}-${new Date().toISOString()}`,
        planName: plan.nomeDoPlano,
        workoutDay: day,
        feedback: feedback,
        completedAt: new Date().toISOString(),
      };

      const existingHistoryRaw = localStorage.getItem('workoutHistory');
      const existingHistory: WorkoutHistoryEntry[] = existingHistoryRaw ? JSON.parse(existingHistoryRaw) : [];
      
      const updatedHistory = [...existingHistory, historyEntry];
      localStorage.setItem('workoutHistory', JSON.stringify(updatedHistory));

    } catch (e) {
      console.error("Erro ao salvar no histórico de treinos", e);
    }
  };


  const handleGeneratePdf = () => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    const companyName = "Gerador de Treinos com IA";

    const addText = (text: string, x: number, yPos: number, options: any = {}, maxWidth = 180) => {
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, yPos, options);
        // Calcula a altura do texto com base no número de linhas e tamanho da fonte atual
        const lineHeight = doc.getLineHeight(text) / doc.internal.scaleFactor;
        return yPos + (lines.length * lineHeight) - ((lines.length -1) * 3); // Ajuste fino para espaçamento
    };
    
    // Página de Rosto (Conforme imagem)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(38);
    doc.setTextColor(0, 0, 0); // Texto preto
    let yTitle = addText(plan.nomeDoPlano, 105, 140, { align: 'center' }, 160);
    
    yTitle += 2; // Pequeno espaço

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128); // Texto cinza para o subtítulo
    doc.text("Seu plano de treino personalizado", 105, yTitle, { align: 'center' });
    doc.setTextColor(0, 0, 0); // Reseta a cor do texto para o padrão


    plan.dias.forEach((day) => {
      doc.addPage();
      let y = 20;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      y = addText(`${day.dia}: ${day.foco}`, 10, y);
      y += 5;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Aquecimento', 10, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      y = addText(day.aquecimento, 15, y);
      y += 8;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Treino Principal', 10, y);
      y += 6;

      // Cabeçalho da tabela
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Exercício', 10, y);
      doc.text('Séries', 110, y);
      doc.text('Reps', 140, y);
      doc.text('Descanso', 170, y);
      y += 2;
      doc.line(10, y, 200, y); // Linha separadora
      y += 5;

      // Corpo da tabela
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      day.exercicios.forEach(ex => {
        if (y > 260) { // Reduzido para dar espaço ao cabeçalho/rodapé
          doc.addPage();
          y = 20;
        }
        const exerciseText = ex.observacoes ? `${ex.nome} (${ex.observacoes})` : ex.nome;
        const exerciseNameLines = doc.splitTextToSize(exerciseText, 95);
        const lineHeight = exerciseNameLines.length * 4;
        
        doc.text(exerciseNameLines, 10, y);
        doc.text(ex.series, 120, y, { align: 'center' });
        doc.text(ex.repeticoes, 150, y, { align: 'center' });
        doc.text(ex.descanso, 180, y, { align: 'center' });
        y += lineHeight + 4;
      });
      
      y += 8;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Resfriamento', 10, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      addText(day.resfriamento, 15, y);
    });

    // Página do Calendário Semanal
    doc.addPage();
    let y = 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text("Calendário Semanal de Treinos", 105, y, { align: 'center' });
    y += 20;

    const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const weeklySchedule = new Array(7).fill('Descanso');
    const workoutDays = plan.dias.map(d => d.foco);

    switch (plan.dias.length) {
      case 3:
        weeklySchedule[0] = workoutDays[0]; // Seg
        weeklySchedule[2] = workoutDays[1]; // Qua
        weeklySchedule[4] = workoutDays[2]; // Sex
        break;
      case 4:
        weeklySchedule[0] = workoutDays[0]; // Seg
        weeklySchedule[1] = workoutDays[1]; // Ter
        weeklySchedule[3] = workoutDays[2]; // Qui
        weeklySchedule[4] = workoutDays[3]; // Sex
        break;
      case 5:
        workoutDays.forEach((foco, i) => { weeklySchedule[i] = foco; }); // Seg-Sex
        break;
      case 6:
        workoutDays.forEach((foco, i) => { weeklySchedule[i] = foco; }); // Seg-Sab
        break;
    }

    const tableX = 15;
    const tableY = y;
    const rowHeight = 25;
    const colWidth = 26;

    // Cabeçalho da tabela (Conforme imagem)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    weekDays.forEach((day, index) => {
      const cellX = tableX + (index * colWidth);
      if (index === 0) { // Segunda
        doc.setFillColor(230, 230, 230); // Fundo cinza claro
        doc.setTextColor(0, 0, 0);       // Texto preto
      } else { // Resto da semana
        doc.setFillColor(0, 0, 0);       // Fundo preto
        doc.setTextColor(255, 255, 255); // Texto branco
      }
      doc.rect(cellX, tableY, colWidth, rowHeight / 2, 'FD');
      doc.text(day, cellX + colWidth / 2, tableY + 8, { align: 'center' });
    });

    // Corpo da tabela
    doc.setTextColor(0, 0, 0); // Reseta a cor do texto para o corpo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    weeklySchedule.forEach((foco, index) => {
        const cellX = tableX + (index * colWidth);
        const cellY = tableY + rowHeight / 2;
        const isRestDay = foco === 'Descanso';

        // Define cores baseadas se é dia de treino ou descanso
        if (isRestDay) {
            doc.setFillColor(245, 245, 245); // Cinza bem claro para descanso
            doc.setTextColor(150, 150, 150); // Texto cinza para descanso
        } else {
            doc.setFillColor(224, 255, 255); // Ciano claro para treino
            doc.setTextColor(0, 0, 0);       // Texto preto para treino
        }
        
        doc.rect(cellX, cellY, colWidth, rowHeight, 'FD'); // Desenha a célula com preenchimento

        // Ajusta o texto para caber na célula
        const lines = doc.splitTextToSize(foco, colWidth - 4); // Margem interna
        const textVOffset = lines.length > 1 ? 8 : 12; // Ajuste vertical para 1 ou 2 linhas
        doc.text(lines, cellX + colWidth / 2, cellY + textVOffset, { align: 'center' });
    });

    doc.setTextColor(0,0,0); // Reseta a cor do texto para o padrão
    
    // Adicionar cabeçalho e rodapé a todas as páginas
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        
        // Adiciona cabeçalho (exceto na primeira página)
        if (i > 1) {
            doc.text(plan.nomeDoPlano, 10, 10);
        }
        
        // Adiciona rodapé
        const footerText = `${companyName} | Página ${i} de ${pageCount}`;
        doc.text(footerText, 105, 290, { align: 'center' });
    }
    
    doc.save(`${plan.nomeDoPlano.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-500">
          {plan.nomeDoPlano}
        </h2>
        <p className="text-gray-400 mt-2 text-lg">Seu plano de treino personalizado está pronto!</p>
      </div>

      <div className="space-y-8">
        {plan.dias.map((day, index) => (
          <WorkoutDayCard 
            key={index} 
            day={day} 
            dayNumber={index + 1}
            feedback={dailyFeedback[day.dia]}
            onDayComplete={(feedback) => handleDayComplete(day, feedback)}
          />
        ))}
      </div>
      
      <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onReset}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <ArrowLeftIcon />
          Voltar ao Início
        </button>
        <button
          onClick={handleGeneratePdf}
          className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <DownloadIcon />
          Gerar PDF
        </button>
      </div>
    </div>
  );
};

interface WorkoutDayCardProps {
  day: WorkoutDay;
  dayNumber: number;
  feedback?: string;
  onDayComplete: (feedback: string) => void;
}

const WorkoutDayCard: React.FC<WorkoutDayCardProps> = ({ day, dayNumber, feedback, onDayComplete }) => {
  const [showFeedbackOptions, setShowFeedbackOptions] = useState(false);

  return (
    <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center mb-4">
        <div className="bg-cyan-500/10 text-cyan-400 font-bold rounded-full w-12 h-12 flex items-center justify-center text-xl mr-4 border-2 border-cyan-500/30">
          {dayNumber}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">{day.dia}: <span className="text-cyan-400">{day.foco}</span></h3>
        </div>
        {feedback && <CheckCircleIcon className="w-7 h-7 text-green-400 ml-auto" />}
      </div>
      
      <div className="space-y-6">
        <WorkoutSection title="Aquecimento" content={day.aquecimento} icon={<FireIcon />} />
        
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
                {day.exercicios.map((ex, i) => (
                  <ExerciseRow key={i} exercise={ex} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <WorkoutSection title="Resfriamento" content={day.resfriamento} icon={<SnowflakeIcon />} />
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700 text-center">
        {feedback ? (
          <p className="text-lg text-green-400 font-semibold italic">
            Dia finalizado! Seu feedback: "{feedback}"
          </p>
        ) : showFeedbackOptions ? (
          <FeedbackSelector onSelect={(f) => {
            onDayComplete(f);
            setShowFeedbackOptions(false);
          }} />
        ) : (
          <button
            onClick={() => setShowFeedbackOptions(true)}
            className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-5 rounded-lg transition-colors flex items-center justify-center mx-auto gap-2"
          >
            <CheckCircleIcon className="w-5 h-5" />
            Finalizar Dia
          </button>
        )}
      </div>

    </div>
  );
};

const FeedbackSelector: React.FC<{ onSelect: (feedback: string) => void }> = ({ onSelect }) => {
  const options = ['Foi desafiador', 'Muito bom', 'Precisa de ajustes'];
  return (
    <div className="animate-fade-in">
      <p className="text-gray-300 mb-3 font-semibold">Como foi o treino de hoje?</p>
      <div className="flex flex-wrap justify-center gap-3">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className="bg-gray-600 hover:bg-gray-500 text-white text-sm py-2 px-4 rounded-lg transition-colors"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};


const ExerciseRow: React.FC<{ exercise: Exercise }> = ({ exercise }) => (
  <tr className="bg-gray-800 hover:bg-gray-700/50 transition-colors">
    <td className="p-3">
      <p className="font-bold text-white">{exercise.nome}</p>
      {exercise.observacoes && <p className="text-xs text-gray-400">{exercise.observacoes}</p>}
    </td>
    <td className="p-3 text-center text-gray-300">{exercise.series}</td>
    <td className="p-3 text-center text-gray-300">{exercise.repeticoes}</td>
    <td className="p-3 text-center text-gray-300">{exercise.descanso}</td>
  </tr>
);

const WorkoutSection: React.FC<{ title: string, content: string, icon: React.ReactNode }> = ({ title, content, icon }) => (
  <div>
    <h4 className="text-lg font-semibold text-gray-200 mb-2 flex items-center">
      <div className="w-5 h-5 mr-2 text-cyan-400">{icon}</div>
      {title}
    </h4>
    <p className="text-gray-400 pl-7">{content}</p>
  </div>
);


// Ícones
const FireIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 3.75 3.75 0 0 0-7.49 0a3.75 3.75 0 0 0 5.25 6.245 3.75 3.75 0 0 0 .255-1.025S12 10.5 12 10.5a3.75 3.75 0 0 0 0 7.5Z" /></svg>;
const DumbbellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.25A2.25 2.25 0 0018.75 11H17V8.75A2.25 2.25 0 0014.75 6.5h-1.5a2.25 2.25 0 00-2.25 2.25V11H7a2.25 2.25 0 00-2.25 2.25v0A2.25 2.25 0 007 15.5h4v2.25A2.25 2.25 0 0013.25 20h1.5a2.25 2.25 0 002.25-2.25V15.5h1.75A2.25 2.25 0 0021 13.25zM7 11V8.75A2.25 2.25 0 019.25 6.5h0A2.25 2.25 0 0111.5 8.75V11m-4.5 4.5v2.25A2.25 2.25 0 009.25 20h0a2.25 2.25 0 002.25-2.25V15.5" />
  </svg>
);
const SnowflakeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15m4.243-5.257L6.75 14.243m10.5-7.486L9.757 16.243" /></svg>;
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);
const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);


export default WorkoutDisplay;