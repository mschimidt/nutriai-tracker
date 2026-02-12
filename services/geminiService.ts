import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Food Analysis ---

export interface FoodAnalysisResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string;
}

export const analyzeFood = async (
  text: string,
  imageBase64?: string
): Promise<FoodAnalysisResult> => {
  try {
    const modelId = imageBase64 ? "gemini-2.5-flash-image" : "gemini-3-flash-preview";
    
    const parts: any[] = [];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64,
        },
      });
    }

    if (text) {
      parts.push({ text: `Contexto adicional do usuário: ${text}` });
    } else if (!text && imageBase64) {
        parts.push({ text: "Analise esta imagem de comida." });
    }

    const prompt = `
      Identifique os alimentos, estime o tamanho das porções e calcule as calorias totais e macronutrientes.
      Seja preciso e conservador nas estimativas.
      Forneça uma curta descrição do que foi identificado em português.
    `;

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.NUMBER, description: "Total de calorias estimadas" },
            protein: { type: Type.NUMBER, description: "Proteína em gramas" },
            carbs: { type: Type.NUMBER, description: "Carboidratos em gramas" },
            fat: { type: Type.NUMBER, description: "Gorduras em gramas" },
            description: { type: Type.STRING, description: "Breve resumo do prato identificado (max 10 palavras)" },
          },
          required: ["calories", "protein", "carbs", "fat", "description"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as FoodAnalysisResult;
    }
    throw new Error("Sem resposta da IA");
  } catch (error) {
    console.error("Food Analysis Error:", error);
    throw error;
  }
};

// --- Workout Analysis ---

export interface WorkoutAnalysisResult {
  caloriesBurned: number;
  analysis: string;
  intensity: string;
}

export const analyzeWorkout = async (
  profile: UserProfile,
  description: string,
  imageBase64?: string
): Promise<WorkoutAnalysisResult> => {
  try {
    const modelId = imageBase64 ? "gemini-2.5-flash-image" : "gemini-3-flash-preview";
    const parts: any[] = [];

    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64,
        },
      });
    }

    let textPrompt = `
      Usuário:
      Peso: ${profile.weight} kg
      Altura: ${profile.height} cm
      TMB (Basal): ${profile.tmb} kcal/dia
    `;

    if (description) {
        textPrompt += `\nDescrição do treino: "${description}"`;
    }

    if (imageBase64) {
        textPrompt += `\nAnalise a imagem fornecida (pode ser equipamentos, painel de esteira/relógio ou o ambiente).`;
    }

    textPrompt += `\n
      Com base nos dados biométricos, na descrição e na imagem (se houver), estime as calorias gastas (acima do repouso).
      Classifique a intensidade.
      Se a imagem mostrar um valor de calorias explícito (ex: painel de esteira), use-o como referência principal, mas valide se faz sentido.
    `;

    parts.push({ text: textPrompt });

    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            caloriesBurned: { type: Type.NUMBER, description: "Calorias gastas estimadas pelo exercício" },
            analysis: { type: Type.STRING, description: "Breve explicação do cálculo ou confirmação do exercício" },
            intensity: { type: Type.STRING, description: "Baixa, Média, Alta ou Muito Alta" },
          },
          required: ["caloriesBurned", "analysis", "intensity"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as WorkoutAnalysisResult;
    }
    throw new Error("Sem resposta da IA");
  } catch (error) {
    console.error("Workout Analysis Error:", error);
    throw error;
  }
};
