

export type FitnessGoal = 'ganho_de_massa' | 'perda_de_gordura' | 'resistencia';
export type ExperienceLevel = 'iniciante' | 'intermediario' | 'avancado';
export type Equipment = 'peso_corporal' | 'halteres' | 'academia_completa';
export type WorkoutDuration = 30 | 45 | 60;
export type Gender = 'masculino' | 'feminino';
export type DaysPerWeek = 3 | 4 | 5 | 6;

export interface WorkoutPreferences {
  goal: FitnessGoal[];
  level: ExperienceLevel;
  equipment: Equipment;
  duration: WorkoutDuration;
  daysPerWeek: DaysPerWeek;
  gender: Gender;
}

export interface Exercise {
  nome: string;
  series: string;
  repeticoes: string;
  descanso: string;
  observacoes?: string;
}

export interface WorkoutDay {
  dia: string;
  foco: string;
  aquecimento: string;
  exercicios: Exercise[];
  resfriamento: string;
}

export interface WorkoutPlan {
  nomeDoPlano: string;
  dias: WorkoutDay[];
}

export interface WorkoutHistoryEntry {
  id: string;
  planName: string;
  workoutDay: WorkoutDay;
  feedback: string;
  completedAt: string; // ISO string
}