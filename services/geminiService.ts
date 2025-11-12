
import { GoogleGenAI, Type } from '@google/genai';
import { WorkoutPreferences, WorkoutPlan, Gender } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const goalMap: Record<WorkoutPreferences['goal'][number], string> = {
  ganho_de_massa: 'Ganho de Massa Muscular (Hipertrofia)',
  perda_de_gordura: 'Perda de Gordura e Definição',
  resistencia: 'Melhora da Resistência Cardiovascular e Muscular',
};

const levelMap: Record<WorkoutPreferences['level'], string> = {
  iniciante: 'Iniciante (menos de 6 meses de treino)',
  intermediario: 'Intermediário (6 meses a 2 anos de treino)',
  avancado: 'Avançado (mais de 2 anos de treino consistente)',
};

const equipmentMap: Record<WorkoutPreferences['equipment'], string> = {
  peso_corporal: 'Apenas Peso Corporal',
  halteres: 'Halteres e alguns equipamentos básicos',
  academia_completa: 'Acesso a uma academia completa com máquinas e pesos livres',
};

const genderMap: Record<Gender, string> = {
  masculino: 'Masculino',
  feminino: 'Feminino',
};

const workoutPlanSchema = {
  type: Type.OBJECT,
  properties: {
    nomeDoPlano: { 
      type: Type.STRING,
      description: 'Um nome criativo e motivador para o plano de treino.'
    },
    dias: {
      type: Type.ARRAY,
      description: 'Uma lista de dias de treino, conforme solicitado pelo usuário.',
      items: {
        type: Type.OBJECT,
        properties: {
          dia: { 
            type: Type.STRING,
            description: 'O número ou nome do dia de treino, e.g., "Dia A" ou "Segunda-feira".'
          },
          foco: {
            type: Type.STRING,
            description: 'O foco principal do treino do dia, e.g., "Corpo Inteiro", "Peito", "Costas", "Pernas".'
          },
          aquecimento: {
            type: Type.STRING,
            description: 'Uma breve descrição da rotina de aquecimento (5-10 min), incluindo exercícios como polichinelos, rotação de articulações, etc.'
          },
          exercicios: {
            type: Type.ARRAY,
            description: 'Uma lista de exercícios para o treino principal.',
            items: {
              type: Type.OBJECT,
              properties: {
                nome: { 
                  type: Type.STRING,
                  description: 'O nome do exercício.'
                },
                series: {
                  type: Type.STRING,
                  description: 'O número de séries a serem realizadas, e.g., "3" ou "4".'
                },
                repeticoes: {
                  type: Type.STRING,
                  description: 'A faixa de repetições por série, e.g., "8-12" ou "15-20".'
                },
                descanso: {
                  type: Type.STRING,
                  description: 'O tempo de descanso entre as séries, e.g., "60 segundos".'
                },
                observacoes: {
                  type: Type.STRING,
                  description: 'Dicas opcionais sobre a execução do exercício ou alternativas.'
                }
              },
              required: ['nome', 'series', 'repeticoes', 'descanso'],
            }
          },
          resfriamento: {
            type: Type.STRING,
            description: 'Uma breve descrição da rotina de resfriamento (5 min), focada em alongamentos leves dos músculos trabalhados.'
          }
        },
        required: ['dia', 'foco', 'aquecimento', 'exercicios', 'resfriamento'],
      }
    }
  },
  required: ['nomeDoPlano', 'dias'],
};


export const generateWorkoutPlan = async (preferences: WorkoutPreferences): Promise<WorkoutPlan> => {
  const goalsText = preferences.goal.map(g => goalMap[g]).join(' e ');
  
  const prompt = `
    Você é um personal trainer de elite e especialista em fitness com conhecimento profundo de fisiologia do exercício.
    Sua tarefa é criar um plano de treino semanal detalhado, seguro e eficaz, que combine os objetivos do usuário.

    Preferências do Usuário:
    - Gênero: ${genderMap[preferences.gender]}
    - Objetivos Principais: ${goalsText}
    - Nível de Experiência: ${levelMap[preferences.level]}
    - Equipamentos Disponíveis: ${equipmentMap[preferences.equipment]}
    - Dias de Treino por Semana: ${preferences.daysPerWeek}
    - Duração Desejada por Sessão: ${preferences.duration} minutos

    Instruções:
    1. Crie um plano de treino estruturado que integre de forma inteligente TODOS os objetivos listados. O plano deve ser adaptado para o gênero do usuário, considerando diferenças fisiológicas gerais quando relevante.
    2. O plano deve ter exatamente ${preferences.daysPerWeek} dias de treino.
    3. Use a divisão de treino mais apropriada para a frequência semanal solicitada. Por exemplo: 3 dias = Corpo Inteiro; 4 dias = Superior/Inferior; 5 dias = ABCDE (Peito, Costas, Pernas, Ombros, Braços); 6 dias = Empurrar/Puxar/Pernas x2.
    4. Para cada dia de treino, inclua uma rotina de aquecimento, uma lista de exercícios para o treino principal e uma rotina de resfriamento.
    5. Os exercícios devem ser adequados aos equipamentos disponíveis.
    6. O volume (séries x repetições) e a intensidade devem ser consistentes com a combinação de objetivos e o nível do usuário.
    7. A duração total da sessão (aquecimento + treino + resfriamento) deve se aproximar da duração desejada.
    8. Forneça o resultado estritamente no formato JSON, seguindo o schema fornecido.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: workoutPlanSchema,
      },
    });

    const jsonText = response.text.trim();
    const plan = JSON.parse(jsonText) as WorkoutPlan;
    return plan;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate workout plan from API.");
  }
};