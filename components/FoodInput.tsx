import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { analyzeFood, FoodAnalysisResult } from '../services/geminiService';
import { LogEntry } from '../types';

interface FoodInputProps {
  onAddLog: (log: LogEntry) => void;
  onCancel: () => void;
}

export const FoodInput: React.FC<FoodInputProps> = ({ onAddLog, onCancel }) => {
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
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
    if (!description && !imagePreview) return;
    
    setIsLoading(true);
    setResult(null);

    try {
      // Strip 'data:image/jpeg;base64,' for Gemini
      const base64Data = imagePreview ? imagePreview.split(',')[1] : undefined;
      const analysis = await analyzeFood(description, base64Data);
      setResult(analysis);
    } catch (error) {
      alert("Erro ao analisar a refeição. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!result) return;
    
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: 'food',
      description: result.description,
      calories: result.calories,
      macros: {
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat
      },
      imageUrl: imagePreview || undefined
    };

    onAddLog(newLog);
  };

  if (result) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <h2 className="text-2xl font-bold text-gray-800">Resultado</h2>
        
        {imagePreview && (
          <img src={imagePreview} alt="Food" className="w-full h-48 object-cover rounded-2xl shadow-sm" />
        )}

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 capitalize">{result.description}</h3>
            <p className="text-emerald-600 font-medium text-lg">{result.calories} kcal</p>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 p-2 rounded-lg text-center">
              <span className="block text-xs text-gray-500">Prot</span>
              <span className="font-bold text-gray-800">{result.protein}g</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg text-center">
              <span className="block text-xs text-gray-500">Carb</span>
              <span className="font-bold text-gray-800">{result.carbs}g</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg text-center">
              <span className="block text-xs text-gray-500">Gord</span>
              <span className="font-bold text-gray-800">{result.fat}g</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setResult(null)} className="flex-1">
            Voltar
          </Button>
          <Button onClick={handleConfirm} className="flex-1">
            Salvar Registro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h2 className="text-2xl font-bold text-gray-800">Nova Refeição</h2>
        <p className="text-gray-500 text-sm">Tire uma foto ou descreva o que comeu.</p>
      </header>

      <div className="space-y-4">
        {/* Image Upload Area */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${imagePreview ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'}`}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="h-40 object-contain rounded-lg" />
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3 text-emerald-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </div>
              <p className="text-sm font-medium text-gray-700">Toque para adicionar foto</p>
              <p className="text-xs text-gray-400 mt-1">Opcional, mas recomendado</p>
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

        {/* Text Input */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Arroz integral, 1 filé de frango grelhado e salada verde..."
            className="w-full p-4 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none h-32 text-gray-800"
            />
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="ghost" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={(!description && !imagePreview)} 
            isLoading={isLoading}
            className="flex-1"
          >
            Calcular Calorias
          </Button>
        </div>
      </div>
    </div>
  );
};
