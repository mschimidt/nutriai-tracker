import { GoogleGenAI, Type } from "@google/genai";
import { FoodAnalysisResult, UserStats, WorkoutAnalysisResult } from "../types";

// Initialize Gemini Client
// Requires 'process.env.API_KEY' which is polyfilled in vite.config.ts
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Helper to convert a File object to a Base64 string suitable for Gemini
 */
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Analyzes food intake from text description and/or image
 */
export const analyzeFoodIntake = async (
  description: string,
  imageFile: File | null
): Promise<FoodAnalysisResult> => {
  
  const parts: any[] = [];
  
  if (imageFile) {
    const imagePart = await fileToGenerativePart(imageFile);
    parts.push(imagePart);
  }
  
  if (description) {
    parts.push({ text: `Descrição da comida: ${description}` });
  }

  const prompt = `
    Analise a imagem da comida fornecida e/ou a descrição.
    Identifique os itens alimentares.
    Estime o total de calorias.
    Forneça uma divisão de macronutrientes (Proteína, Carboidratos, Gorduras).
    Forneça um breve resumo em PORTUGUÊS (PT-BR).
    
    Retorne a resposta em formato JSON correspondente a este esquema:
    {
      "foodName": "string (Nome do prato principal ou resumo em PT-BR)",
      "estimatedCalories": number,
      "macros": {
        "protein": "string (ex: 20g)",
        "carbs": "string",
        "fat": "string"
      },
      "confidence": "string (Alta/Média/Baixa)",
      "summary": "string (Resumo amigável em Português PT-BR)"
    }
  `;

  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING },
            estimatedCalories: { type: Type.NUMBER },
            macros: {
              type: Type.OBJECT,
              properties: {
                protein: { type: Type.STRING },
                carbs: { type: Type.STRING },
                fat: { type: Type.STRING },
              }
            },
            confidence: { type: Type.STRING },
            summary: { type: Type.STRING },
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as FoodAnalysisResult;
    }
    throw new Error("Nenhum dado retornado pela IA");
  } catch (error) {
    console.error("Gemini Food Analysis Error:", error);
    throw error;
  }
};

/**
 * Analyzes workout based on user stats, description, and/or image
 */
export const analyzeWorkout = async (
  stats: UserStats,
  description: string,
  imageFile: File | null
): Promise<WorkoutAnalysisResult> => {

  const parts: any[] = [];

  if (imageFile) {
    const imagePart = await fileToGenerativePart(imageFile);
    parts.push(imagePart);
  }

  const userContext = `
    Estatísticas do Usuário:
    Peso: ${stats.weight}kg
    Altura: ${stats.height}cm
    TMB (Taxa Metabólica Basal): ${stats.tmb} kcal/dia
  `;
  
  parts.push({ text: userContext });
  
  if (description) {
    parts.push({ text: `Descrição do treino: ${description}` });
  }

  const prompt = `
    Analise a descrição do treino fornecida ou a imagem (que pode ser a tela de uma máquina de academia, um quadro de resumo de treino ou uma selfie) no contexto das Estatísticas do Usuário.
    Estime o total de calorias queimadas durante esta sessão específica.
    Responda em PORTUGUÊS (PT-BR).
    
    Retorne a resposta em formato JSON correspondente a este esquema:
    {
      "workoutType": "string (Tipo de treino em PT-BR)",
      "caloriesBurned": number,
      "intensity": "string (Baixa/Moderada/Alta)",
      "summary": "string (Breve análise do esforço em Português PT-BR)"
    }
  `;

  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            workoutType: { type: Type.STRING },
            caloriesBurned: { type: Type.NUMBER },
            intensity: { type: Type.STRING },
            summary: { type: Type.STRING },
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as WorkoutAnalysisResult;
    }
    throw new Error("Nenhum dado retornado pela IA");
  } catch (error) {
    console.error("Gemini Workout Analysis Error:", error);
    throw error;
  }
};
