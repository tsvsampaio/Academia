
import React, { useState, useEffect } from 'react';
import { WorkoutPreferences, FitnessGoal, ExperienceLevel, Equipment, WorkoutDuration, Gender, DaysPerWeek } from '../types';

interface WorkoutFormProps {
  onSubmit: (preferences: WorkoutPreferences) => void;
  suggestedGoals?: FitnessGoal[];
  gender: Gender;
  onBack: () => void;
}

// Icons
// FIX: Moved icon definitions before they are used to solve block-scoped variable errors.
const MuscleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 8.25v-1.5a.75.75 0 0 0-1.5 0v1.5m0 0v1.5a.75.75 0 0 0 1.5 0v-1.5m0 0h1.5a.75.75 0 0 0 0-1.5h-1.5m0 0h-1.5a.75.75 0 0 0 0 1.5h1.5m-1.5 9v.75a.75.75 0 0 0 1.5 0v-.75m0 0v-.75a.75.75 0 0 0-1.5 0v.75m0 0h.75a.75.75 0 0 0 0-1.5h-.75m0 0h-.75a.75.75 0 0 0 0 1.5h.75M12 18.75a6 6 0 0 0 3.75-10.875a6 6 0 0 0-7.5 0 6 6 0 0 0 3.75 10.875Z" /></svg>;
const FireIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 3.75 3.75 0 0 0-7.49 0a3.75 3.75 0 0 0 5.25 6.245 3.75 3.75 0 0 0 .255-1.025S12 10.5 12 10.5a3.75 3.75 0 0 0 0 7.5Z" /></svg>;
const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>;
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>;
const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

// FIX: Changed JSX.Element to React.ReactNode to fix "Cannot find namespace 'JSX'" error.
const goals: { id: FitnessGoal; label: string; icon: React.ReactNode }[] = [
  { id: 'ganho_de_massa', label: 'Ganho de Massa', icon: <MuscleIcon /> },
  { id: 'perda_de_gordura', label: 'Perda de Gordura', icon: <FireIcon /> },
  { id: 'resistencia', label: 'Resistência', icon: <HeartIcon /> },
];

const levels: { id: ExperienceLevel; label: string }[] = [
  { id: 'iniciante', label: 'Iniciante' },
  { id: 'intermediario', label: 'Intermediário' },
  { id: 'avancado', label: 'Avançado' },
];

const equipments: { id: Equipment; label: string }[] = [
  { id: 'peso_corporal', label: 'Peso Corporal' },
  { id: 'halteres', label: 'Halteres' },
  { id: 'academia_completa', label: 'Academia' },
];

const durations: { id: WorkoutDuration; label: string }[] = [
  { id: 30, label: '30 min' },
  { id: 45, label: '45 min' },
  { id: 60, label: '60 min' },
];

const days: { id: DaysPerWeek; label: string }[] = [
  { id: 3, label: '3 dias' },
  { id: 4, label: '4 dias' },
  { id: 5, label: '5 dias' },
  { id: 6, label: '6 dias' },
];

const WorkoutForm: React.FC<WorkoutFormProps> = ({ onSubmit, suggestedGoals = [], gender, onBack }) => {
  const [preferences, setPreferences] = useState<WorkoutPreferences>({
    goal: [],
    level: 'iniciante',
    equipment: 'peso_corporal',
    duration: 45,
    daysPerWeek: 4,
    gender: gender,
  });

  useEffect(() => {
    if (suggestedGoals.length > 0) {
      setPreferences(prev => ({ ...prev, goal: suggestedGoals }));
    }
  }, [suggestedGoals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (preferences.goal.length > 0) {
      onSubmit(preferences);
    }
  };

  const handleGoalSelect = (selectedGoal: FitnessGoal) => {
    setPreferences(prev => {
      const currentGoals = prev.goal;
      const isSelected = currentGoals.includes(selectedGoal);

      if (isSelected) {
        // Deselect if already selected
        return { ...prev, goal: currentGoals.filter(g => g !== selectedGoal) };
      } else {
        // Select if less than 2 are already selected
        if (currentGoals.length < 2) {
          return { ...prev, goal: [...currentGoals, selectedGoal] };
        }
      }
      // Do nothing if trying to select a 3rd goal
      return prev;
    });
  };

  const handleSelect = <K extends keyof Omit<WorkoutPreferences, 'goal' | 'gender'>>(field: K, value: WorkoutPreferences[K]) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };
  

  return (
    <div className="w-full max-w-3xl bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 md:p-10 shadow-2xl animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">Crie seu Treino Perfeito</h2>
        <p className="text-gray-400 mt-2">Personalize cada detalhe para atingir seus objetivos.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        
        <FormSection title="1. Qual é o seu objetivo principal?">
          <p className="text-sm text-gray-500 mb-4 -mt-3">Selecione até dois. A sugestão do seu IMC já está marcada!</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {goals.map(({ id, label, icon }) => (
              <SelectionCard
                key={id}
                id={`goal-${id}`}
                name="goal"
                label={label}
                icon={icon}
                checked={preferences.goal.includes(id)}
                onChange={() => handleGoalSelect(id)}
              />
            ))}
          </div>
        </FormSection>

        <FormSection title="2. Qual o seu nível de experiência?">
          <SegmentedControl
            name="level"
            options={levels}
            selectedValue={preferences.level}
            onChange={(value) => handleSelect('level', value as ExperienceLevel)}
          />
        </FormSection>

        <FormSection title="3. Que equipamento você tem?">
          <SegmentedControl
            name="equipment"
            options={equipments}
            selectedValue={preferences.equipment}
            onChange={(value) => handleSelect('equipment', value as Equipment)}
          />
        </FormSection>
        
        <FormSection title="4. Quantos dias por semana você quer treinar?">
          <SegmentedControl
            name="daysPerWeek"
            options={days}
            selectedValue={preferences.daysPerWeek}
            onChange={(value) => handleSelect('daysPerWeek', value as DaysPerWeek)}
          />
        </FormSection>

        <FormSection title="5. Quanto tempo por sessão?">
           <SegmentedControl
            name="duration"
            options={durations}
            selectedValue={preferences.duration}
            onChange={(value) => handleSelect('duration', value as WorkoutDuration)}
          />
        </FormSection>

        <div className="pt-6 border-t border-gray-700 flex flex-col-reverse sm:flex-row items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white font-bold text-lg py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center"
          >
            <ArrowLeftIcon />
            <span className="ml-2">Voltar</span>
          </button>
          <button
            type="submit"
            disabled={preferences.goal.length === 0}
            className="w-full sm:flex-1 bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold text-lg py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300/50 flex items-center justify-center disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none"
          >
            <SparklesIcon className="w-6 h-6 mr-3" />
            Gerar Meu Treino
          </button>
        </div>
      </form>
    </div>
  );
};

interface FormSectionProps {
    title: string;
    children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({title, children}) => (
    <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-4">{title}</h3>
        {children}
    </div>
);

interface SelectionCardProps {
    id: string;
    name: string;
    label: string;
    icon: React.ReactNode;
    checked: boolean;
    onChange: () => void;
}

const SelectionCard: React.FC<SelectionCardProps> = ({ id, name, label, icon, checked, onChange }) => (
    <div>
        <input type="checkbox" id={id} name={name} checked={checked} onChange={onChange} className="hidden" />
        <label htmlFor={id} className={`block p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 text-center ${checked ? 'border-cyan-400 bg-cyan-900/50 scale-105' : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'}`}>
            <div className={`mx-auto w-10 h-10 mb-2 transition-colors ${checked ? 'text-cyan-400' : 'text-gray-400'}`}>
                {icon}
            </div>
            <span className={`font-medium transition-colors ${checked ? 'text-cyan-300' : 'text-gray-300'}`}>{label}</span>
        </label>
    </div>
);


interface SegmentedControlProps<T extends string | number> {
    name: string;
    options: { id: T; label: string }[];
    selectedValue: T;
    onChange: (value: T) => void;
}

function SegmentedControl<T extends string | number>({ name, options, selectedValue, onChange }: SegmentedControlProps<T>) {
    return (
        <div className="flex w-full bg-gray-700 rounded-lg p-1">
            {options.map(({ id, label }) => (
                <div key={id} className="w-full">
                    <input
                        type="radio"
                        id={`${name}-${id}`}
                        name={name}
                        value={id}
                        checked={selectedValue === id}
                        onChange={() => onChange(id)}
                        className="hidden"
                    />
                    <label
                        htmlFor={`${name}-${id}`}
                        className={`block text-center text-sm font-semibold py-2 px-3 rounded-md cursor-pointer transition-colors duration-300 ${selectedValue === id ? 'bg-cyan-500 text-gray-900 shadow' : 'text-gray-300 hover:bg-gray-600/50'}`}
                    >
                        {label}
                    </label>
                </div>
            ))}
        </div>
    );
}

export default WorkoutForm;