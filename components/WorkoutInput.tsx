import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { analyzeWorkout, WorkoutAnalysisResult } from '../services/geminiService';
import { LogEntry, UserProfile } from '../types';

interface WorkoutInputProps {
  userProfile: UserProfile;
  onAddLog: (log: LogEntry) => void;
  onUpdateProfile: (profile: UserProfile) => void;
  onCancel: () => void;
}

export const WorkoutInput: React.FC<WorkoutInputProps> = ({ userProfile, onAddLog, onUpdateProfile, onCancel }) => {
  // Local state for profile form to allow editing before calculating
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<WorkoutAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if ((!description && !imagePreview) || !profile.weight || !profile.height || !profile.tmb) return;
    
    // Update global profile first
    onUpdateProfile(profile);

    setIsLoading(true);
    setResult(null);

    try {
      // Strip 'data:image/jpeg;base64,' for Gemini
      const base64Data = imagePreview ? imagePreview.split(',')[1] : undefined;
      const analysis = await analyzeWorkout(profile, description, base64Data);
      setResult(analysis);
    } catch (error) {
      alert("Erro ao analisar o treino. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!result) return;
    
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: 'workout',
      description: description || result.analysis, // Use original description or result.analysis
      caloriesBurned: result.caloriesBurned,
      duration: 0,
      imageUrl: imagePreview || undefined
    };

    onAddLog(newLog);
  };

  if (result) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
         <div className="text-center py-6">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
               <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4h-1"/><rect x="6" y="4" width="12" height="12" rx="2"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Treino Analisado!</h2>
         </div>

         {imagePreview && (
          <img src={imagePreview} alt="Workout" className="w-full h-48 object-cover rounded-2xl shadow-sm mb-4" />
        )}

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-gray-500">Gasto Estimado</span>
                <span className="text-3xl font-bold text-orange-500">-{result.caloriesBurned} <span className="text-sm font-normal text-gray-400">kcal</span></span>
            </div>
            <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Análise:</p>
                <p className="text-gray-600 text-sm leading-relaxed">{result.analysis}</p>
            </div>
             <div className="bg-orange-50 px-3 py-2 rounded-lg inline-block">
                <span className="text-xs text-orange-700 font-bold uppercase tracking-wider">Intensidade: {result.intensity}</span>
            </div>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setResult(null)} className="flex-1">
            Voltar
          </Button>
          <Button variant="secondary" onClick={handleConfirm} className="flex-1">
            Registrar Treino
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h2 className="text-2xl font-bold text-gray-800">Novo Treino</h2>
        <p className="text-gray-500 text-sm">Informe seus dados, descreva ou envie foto.</p>
      </header>

      <div className="space-y-5">
        
        {/* Profile Inputs */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Seus Dados (Para precisão)</h3>
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Peso (kg)</label>
                    <input 
                        type="number" 
                        value={profile.weight} 
                        onChange={e => setProfile({...profile, weight: Number(e.target.value)})}
                        className="w-full p-2 bg-gray-50 rounded-lg text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Altura (cm)</label>
                    <input 
                        type="number" 
                        value={profile.height} 
                        onChange={e => setProfile({...profile, height: Number(e.target.value)})}
                        className="w-full p-2 bg-gray-50 rounded-lg text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    />
                </div>
                 <div>
                    <label className="block text-xs text-gray-500 mb-1">TMB (kcal)</label>
                    <input 
                        type="number" 
                        value={profile.tmb} 
                        onChange={e => setProfile({...profile, tmb: Number(e.target.value)})}
                        className="w-full p-2 bg-gray-50 rounded-lg text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    />
                </div>
            </div>
        </div>

        {/* Image Upload Area */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${imagePreview ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'}`}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="h-32 object-contain rounded-lg" />
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-2 text-orange-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <p className="text-sm font-medium text-gray-700">Foto do painel ou equipamento?</p>
              <p className="text-xs text-gray-400">Opcional</p>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Workout Description */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Corrida de 30 min a 8km/h, depois 3 séries de agachamento..."
                className="w-full p-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none h-24 text-gray-800"
            />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button 
            variant="secondary"
            onClick={handleSubmit} 
            disabled={(!description && !imagePreview) || !profile.weight || !profile.tmb} 
            isLoading={isLoading}
            className="flex-1"
          >
            Calcular Gasto
          </Button>
        </div>
      </div>
    </div>
  );
};
