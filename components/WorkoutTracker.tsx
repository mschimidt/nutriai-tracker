import React, { useState, useRef, useEffect } from 'react';
import { analyzeWorkout } from '../services/geminiService';
import { UserStats, WorkoutAnalysisResult, AppView } from '../types';
import { saveLog, saveUserStats, getUserStats } from '../services/storage';

interface WorkoutTrackerProps {
  userId: string;
  setView: (view: AppView) => void;
}

const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({ userId, setView }) => {
  // Stats state
  const [stats, setStats] = useState<UserStats>({ weight: 70, height: 170, tmb: 1600 });
  
  // Workout input state
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WorkoutAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStatsExpanded, setIsStatsExpanded] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load stats from local storage on mount
  useEffect(() => {
    const savedStats = getUserStats(userId);
    setStats(savedStats);
    setIsStatsExpanded(false);
  }, [userId]);

  const handleStatChange = (key: keyof UserStats, value: string) => {
    const numVal = parseFloat(value) || 0;
    const newStats = { ...stats, [key]: numVal };
    setStats(newStats);
    saveUserStats(userId, newStats);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!description && !image) {
      setError("Descreva o treino ou envie uma foto.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeWorkout(stats, description, image);
      setResult(analysis);
    } catch (err) {
      setError("Falha ao analisar. Tente novamente. " + (err instanceof Error ? err.message : ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    
    saveLog(userId, {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: 'WORKOUT',
      title: result.workoutType,
      calories: result.caloriesBurned,
      details: result.summary
    });

    setView(AppView.DASHBOARD);
  };

  const reset = () => {
    setDescription('');
    setImage(null);
    setImagePreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
          <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </span>
          Calculadora de Treino
        </h2>

        {!result ? (
          <div className="space-y-6">
            
            {/* User Stats Accordion-ish */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={() => setIsStatsExpanded(!isStatsExpanded)}>
                <h3 className="font-semibold text-slate-700">Minhas Estatísticas</h3>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${isStatsExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
              
              {isStatsExpanded && (
                <div className="grid grid-cols-3 gap-4 mt-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Peso (kg)</label>
                    <input 
                      type="number" 
                      value={stats.weight} 
                      onChange={(e) => handleStatChange('weight', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Altura (cm)</label>
                    <input 
                      type="number" 
                      value={stats.height} 
                      onChange={(e) => handleStatChange('height', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">TMB (kcal)</label>
                    <input 
                      type="number" 
                      value={stats.tmb} 
                      onChange={(e) => handleStatChange('tmb', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Image Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Foto do Treino (Opcional)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-colors ${imagePreview ? 'border-blue-300 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                ) : (
                  <div className="text-center">
                    <svg className="w-8 h-8 text-slate-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="text-xs text-slate-500">Enviar foto do painel/equipamento</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ex: 30 minutos de esteira HIIT a 10km/h..."
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none h-24"
              />
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-white shadow-md transition-all ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]'}`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Calculando...
                </span>
              ) : 'Calcular Queima'}
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
             <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{result.workoutType}</h3>
                    <p className="inline-block bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">Intensidade: {result.intensity}</p>
                  </div>
                  <div className="text-center">
                    <span className="block text-3xl font-bold text-blue-600">{result.caloriesBurned}</span>
                    <span className="text-xs text-blue-600 font-medium uppercase tracking-wide">Calorias Queimadas</span>
                  </div>
                </div>
                
                <p className="text-slate-700 italic border-l-4 border-blue-300 pl-3">"{result.summary}"</p>
             </div>
             
             <div className="flex space-x-4">
                <button 
                  onClick={reset}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                >
                  Descartar
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors"
                >
                  Salvar no Histórico
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutTracker;
