import React, { useState, useRef } from 'react';
import { analyzeFoodIntake } from '../services/geminiService';
import { FoodAnalysisResult, AppView } from '../types';
import { saveLog } from '../services/storage';

interface FoodTrackerProps {
  userId: string;
  setView: (view: AppView) => void;
}

const FoodTracker: React.FC<FoodTrackerProps> = ({ userId, setView }) => {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setError("Por favor, forneça uma descrição ou uma imagem.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeFoodIntake(description, image);
      setResult(analysis);
    } catch (err) {
      setError("Falha ao analisar. Tente novamente. " + (err instanceof Error ? err.message : ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    
    setLoading(true);
    try {
      await saveLog(userId, {
        timestamp: Date.now(),
        type: 'FOOD',
        title: result.foodName,
        calories: result.estimatedCalories,
        details: result.summary
      });

      setView(AppView.DASHBOARD);
    } catch (e) {
      console.error(e);
      setError("Erro ao salvar no banco de dados.");
      setLoading(false);
    }
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
          <span className="bg-orange-100 text-orange-600 p-2 rounded-lg mr-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </span>
          Análise de Alimentação
        </h2>

        {!result ? (
          <div className="space-y-6">
             {/* Image Upload Area */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Foto da Comida</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer transition-colors ${imagePreview ? 'border-orange-300 bg-orange-50' : 'border-slate-300 hover:border-orange-400 hover:bg-slate-50'}`}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                ) : (
                  <>
                    <svg className="w-10 h-10 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-sm text-slate-500">Toque para enviar imagem</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              {image && (
                 <button 
                  onClick={(e) => { e.stopPropagation(); setImage(null); setImagePreview(null); }}
                  className="text-xs text-red-500 hover:underline"
                 >
                   Remover Imagem
                 </button>
              )}
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descrição (Opcional se enviar imagem)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ex: Filé de frango grelhado com brócolis e arroz integral..."
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none h-24"
              />
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-white shadow-md transition-all ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-orange-50 hover:bg-orange-600 hover:shadow-lg active:scale-[0.98]'}`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Analisando...
                </span>
              ) : 'Analisar Refeição'}
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
             <div className="bg-orange-50 border border-orange-100 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{result.foodName}</h3>
                    <p className="text-sm text-slate-500">Confiança: {result.confidence}</p>
                  </div>
                  <div className="text-center">
                    <span className="block text-3xl font-bold text-orange-600">{result.estimatedCalories}</span>
                    <span className="text-xs text-orange-600 font-medium uppercase tracking-wide">Calorias</span>
                  </div>
                </div>
                
                <p className="text-slate-700 mb-6 italic">"{result.summary}"</p>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 text-center">
                    <span className="block text-sm text-slate-500 mb-1">Proteína</span>
                    <span className="block font-semibold text-slate-800">{result.macros.protein}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 text-center">
                    <span className="block text-sm text-slate-500 mb-1">Carboidratos</span>
                    <span className="block font-semibold text-slate-800">{result.macros.carbs}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 text-center">
                    <span className="block text-sm text-slate-500 mb-1">Gordura</span>
                    <span className="block font-semibold text-slate-800">{result.macros.fat}</span>
                  </div>
                </div>
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
                  {loading ? 'Salvando...' : 'Salvar no Histórico'}
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodTracker;
