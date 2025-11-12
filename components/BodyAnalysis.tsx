
import React, { useState, useMemo } from 'react';
import { FitnessGoal, Gender } from '../types';

interface BodyAnalysisProps {
  onComplete: (data: { suggestedGoals: FitnessGoal[], gender: Gender }) => void;
}

const BodyAnalysis: React.FC<BodyAnalysisProps> = ({ onComplete }) => {
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [gender, setGender] = useState<Gender>('feminino');

  const genderOptions: { id: Gender; label: string }[] = [
    { id: 'feminino', label: 'Feminino' },
    { id: 'masculino', label: 'Masculino' },
  ];

  const bmi = useMemo(() => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (h > 0 && w > 0) {
      return w / (h * h);
    }
    return 0;
  }, [height, weight]);
  
  const isValid = parseFloat(height) > 0 && parseFloat(weight) > 0;

  const analysisData = useMemo(() => {
    if (!isValid) {
      return {
        category: 'default',
        color: 'text-gray-500',
        title: "Vamos começar sua análise",
        analysis: "Por favor, insira sua altura e peso para calcularmos seu Índice de Massa Corporal (IMC) e darmos o primeiro passo.",
        suggestion: "",
        suggestedGoals: [],
      };
    }
    if (bmi < 18.5) {
      return {
        category: 'underweight',
        color: 'text-blue-400',
        title: "Abaixo do Peso",
        analysis: "Seu IMC indica que você está abaixo do peso ideal. Isso pode significar uma menor reserva de energia e massa muscular.",
        suggestion: "Sugerimos um foco inicial em Ganho de Massa Muscular para construir uma base sólida e saudável.",
        suggestedGoals: ['ganho_de_massa'] as FitnessGoal[],
      };
    }
    if (bmi < 25) {
      return {
        category: 'normal',
        color: 'text-green-400',
        title: "Peso Ideal",
        analysis: "Parabéns! Seu IMC está na faixa considerada ideal pela OMS. Você tem uma ótima base para qualquer objetivo.",
        suggestion: "Sugerimos focar em Ganho de Massa Muscular para tonificar e definir seu corpo, ou Resistência para um cardio impecável.",
        suggestedGoals: ['ganho_de_massa'] as FitnessGoal[],
      };
    }
    if (bmi < 30) {
      return {
        category: 'overweight',
        color: 'text-yellow-400',
        title: "Sobrepeso",
        analysis: "Seu IMC está na faixa de sobrepeso. Este é um ótimo ponto de partida para uma transformação focada em saúde.",
        suggestion: "Sugerimos começar com um foco em Perda de Gordura para melhorar sua composição corporal e bem-estar geral.",
        suggestedGoals: ['perda_de_gordura'] as FitnessGoal[],
      };
    }
    return {
      category: 'obese',
      color: 'text-red-400',
      title: "Obesidade",
      analysis: "Seu IMC está na faixa de obesidade. Mudar seus hábitos agora é um passo poderoso para uma vida mais longa e saudável.",
      suggestion: "O foco ideal é a Perda de Gordura e melhora da Resistência, priorizando a saúde cardiovascular.",
      suggestedGoals: ['perda_de_gordura', 'resistencia'] as FitnessGoal[],
    };
  }, [bmi, isValid]);

  const handleSubmit = () => {
    if (isValid) {
      onComplete({ suggestedGoals: analysisData.suggestedGoals, gender });
    }
  };

  return (
    <div className="w-full max-w-4xl bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-2xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 animate-fade-in">
      {/* Coluna do IMC */}
      <div className="w-full md:w-1/3 flex flex-col items-center justify-center text-center p-8 bg-gray-900/20 rounded-lg border border-gray-700">
        <h3 className="text-lg font-medium text-gray-400">Seu Índice de Massa Corporal</h3>
        <div className={`text-7xl font-extrabold my-4 transition-colors duration-500 ${analysisData.color}`}>
            {bmi > 0 ? bmi.toFixed(1) : '--'}
        </div>
        <p className={`font-semibold text-2xl transition-colors duration-500 ${analysisData.color}`}>{analysisData.title}</p>
      </div>

      {/* Coluna do Formulário e Análise */}
      <div className="w-full md:w-2/3">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Análise Corporal</h2>
        <p className="text-gray-400 mb-6">{analysisData.analysis}</p>
        
        <div className="space-y-6 mb-6">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Qual é o seu gênero?</label>
                <SegmentedControl
                    name="gender"
                    options={genderOptions}
                    selectedValue={gender}
                    onChange={(value) => setGender(value as Gender)}
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputControl label="Sua Altura (cm)" value={height} onChange={setHeight} placeholder="ex: 175" />
              <InputControl label="Seu Peso (kg)" value={weight} onChange={setWeight} placeholder="ex: 70.5" />
            </div>
        </div>
        
        {isValid && (
             <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <p className="text-gray-300"><span className="font-bold text-cyan-400">Sugestão:</span> {analysisData.suggestion}</p>
             </div>
        )}

        <div className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold text-lg py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300/50 flex items-center justify-center disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none"
          >
            Avançar para Criar Treino
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

const InputControl: React.FC<{label: string, value: string, onChange: (val: string) => void, placeholder: string}> = ({label, value, onChange, placeholder}) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
        <input 
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
        />
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

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);

export default BodyAnalysis;