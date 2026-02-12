export interface UserProfile {
  uid: string;
  email: string | null;
}

export interface UserStats {
  weight: number; // kg
  height: number; // cm
  tmb: number; // Basal Metabolic Rate
}

export interface FoodAnalysisResult {
  foodName: string;
  estimatedCalories: number;
  macros: {
    protein: string;
    carbs: string;
    fat: string;
  };
  confidence: string;
  summary: string;
}

export interface WorkoutAnalysisResult {
  workoutType: string;
  caloriesBurned: number;
  intensity: string;
  summary: string;
}

export enum AppView {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  FOOD_TRACKER = 'FOOD_TRACKER',
  WORKOUT_TRACKER = 'WORKOUT_TRACKER',
}
