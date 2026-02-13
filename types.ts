export interface UserProfile {
  uid: string;
  email: string | null;
}

export interface UserStats {
  weight: number; // kg
  height: number; // cm
  tmb: number; // Taxa Metabólica Basal
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

export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'FOOD' | 'WORKOUT';
  title: string;
  calories: number; // Positive for food, negative (conceptually) for workout
  details: string; // Summary
}

export enum AppView {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  FOOD_TRACKER = 'FOOD_TRACKER',
  WORKOUT_TRACKER = 'WORKOUT_TRACKER',
}
