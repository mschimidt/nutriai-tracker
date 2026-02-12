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
    parts.push({ text: `Description of food: ${description}` });
  }

  const prompt = `
    Analyze the provided food image and/or description.
    Identify the food items.
    Estimate the total calories.
    Provide a breakdown of macronutrients (Protein, Carbs, Fats).
    Provide a short summary.
    
    Return the response in JSON format matching this schema:
    {
      "foodName": "string (Main dish name or summary)",
      "estimatedCalories": number,
      "macros": {
        "protein": "string (e.g. 20g)",
        "carbs": "string",
        "fat": "string"
      },
      "confidence": "string (High/Medium/Low)",
      "summary": "string (Short friendly summary)"
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
    throw new Error("No data returned from AI");
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
    User Statistics:
    Weight: ${stats.weight}kg
    Height: ${stats.height}cm
    BMR (TMB): ${stats.tmb} kcal/day
  `;
  
  parts.push({ text: userContext });
  
  if (description) {
    parts.push({ text: `Workout Description: ${description}` });
  }

  const prompt = `
    Analyze the provided workout description or image (which might be a gym machine screen, a workout summary board, or a selfie) in context of the User Statistics.
    Estimate the total calories burned during this specific session.
    
    Return the response in JSON format matching this schema:
    {
      "workoutType": "string",
      "caloriesBurned": number,
      "intensity": "string (Low/Moderate/High)",
      "summary": "string (Short analysis of the effort)"
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
    throw new Error("No data returned from AI");
  } catch (error) {
    console.error("Gemini Workout Analysis Error:", error);
    throw error;
  }
};