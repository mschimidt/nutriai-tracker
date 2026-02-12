export interface UserProfile {
  weight: number; // kg
  height: number; // cm
  tmb: number; // Taxa Metabólica Basal
}

export interface MacroNutrients {
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodEntry {
  id: string;
  timestamp: number;
  type: 'food';
  description: string;
  calories: number;
  macros?: MacroNutrients;
  imageUrl?: string;
}

export interface WorkoutEntry {
  id: string;
  timestamp: number;
  type: 'workout';
  description: string;
  caloriesBurned: number;
  duration?: number; // minutes
  imageUrl?: string;
}

export type LogEntry = FoodEntry | WorkoutEntry;

export type ViewState = 'dashboard' | 'food' | 'workout' | 'settings';
