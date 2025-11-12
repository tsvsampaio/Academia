
import React, { useState, useCallback } from 'react';
import { WorkoutPreferences, WorkoutPlan, FitnessGoal, Gender } from './types';
import { generateWorkoutPlan } from './services/geminiService';
import Header from './components/Header';
import WorkoutForm from './components/WorkoutForm';
import WorkoutDisplay from './components/WorkoutDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import Footer from './components/Footer';
import BodyAnalysis from './components/BodyAnalysis';
import WorkoutHistory from './components/WorkoutHistory';

type AppStep = 'analysis' | 'form' | 'loading' | 'result' | 'error';
type AppView = 'main' | 'history';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('analysis');
  const [view, setView] = useState<AppView>('main');
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestedGoals, setSuggestedGoals] = useState<FitnessGoal[]>([]);
  const [gender, setGender] = useState<Gender | null>(null);

  const handleAnalysisComplete = (data: { suggestedGoals: FitnessGoal[], gender: Gender }) => {
    setSuggestedGoals(data.suggestedGoals);
    setGender(data.gender);
    setCurrentStep('form');
  };

  const handleFormSubmit = useCallback(async (preferences: WorkoutPreferences) => {
    setCurrentStep('loading');
    setError(null);
    setWorkoutPlan(null);
    try {
      const plan = await generateWorkoutPlan(preferences);
      setWorkoutPlan(plan);
      setCurrentStep('result');
    } catch (err) {
      setError('Desculpe, ocorreu um erro ao gerar seu treino. Por favor, tente novamente.');
      console.error(err);
      setCurrentStep('error');
    }
  }, []);
  
  const resetApp = () => {
    setWorkoutPlan(null);
    setError(null);
    setSuggestedGoals([]);
    setGender(null);
    setCurrentStep('analysis');
    setView('main');
  }
  
  const renderContent = () => {
    if (view === 'history') {
      return <WorkoutHistory onBack={() => setView('main')} />;
    }

    switch(currentStep) {
      case 'analysis':
        return <BodyAnalysis onComplete={handleAnalysisComplete} />;
      case 'form':
        return gender ? <WorkoutForm onSubmit={handleFormSubmit} suggestedGoals={suggestedGoals} gender={gender} onBack={resetApp} /> : null;
      case 'loading':
        return <LoadingSpinner />;
      case 'error':
        return (
          <div className="text-center bg-red-900/50 border border-red-700 p-8 rounded-xl max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Ocorreu um Erro</h2>
            <p className="text-red-200 mb-6">{error}</p>
            <button
              onClick={resetApp}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Começar Novamente
            </button>
          </div>
        );
      case 'result':
        return workoutPlan ? <WorkoutDisplay plan={workoutPlan} onReset={resetApp} /> : null;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header onShowHistory={() => setView('history')} />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;