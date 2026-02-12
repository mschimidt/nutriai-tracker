import React, { useState, useRef } from 'react';
import { analyzeFoodIntake } from '../services/geminiService';
import { FoodAnalysisResult } from '../types';

const FoodTracker: React.FC = () => {
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
      setError("Please provide a description or an image.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeFoodIntake(description, image);
      setResult(analysis);
    } catch (err) {
      setError("Failed to analyze. Please try again. " + (err instanceof Error ? err.message : ''));
    } finally {
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
          Food Analysis
        </h2>

        {!result ? (
          <div className="space-y-6">
             {/* Image Upload Area */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Food Photo</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer transition-colors ${imagePreview ? 'border-orange-300 bg-orange-50' : 'border-slate-300 hover:border-orange-400 hover:bg-slate-50'}`}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                ) : (
                  <>
                    <svg className="w-10 h-10 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-sm text-slate-500">Tap to upload image</p>
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
                   Remove Image
                 </button>
              )}
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional if image provided)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Grilled chicken breast with broccoli and brown rice..."
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none h-24"
              />
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-white shadow-md transition-all ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 hover:shadow-lg active:scale-[0.98]'}`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Analyzing...
                </span>
              ) : 'Analyze Meal'}
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
             <div className="bg-orange-50 border border-orange-100 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{result.foodName}</h3>
                    <p className="text-sm text-slate-500">{result.confidence} Confidence</p>
                  </div>
                  <div className="text-center">
                    <span className="block text-3xl font-bold text-orange-600">{result.estimatedCalories}</span>
                    <span className="text-xs text-orange-600 font-medium uppercase tracking-wide">Calories</span>
                  </div>
                </div>
                
                <p className="text-slate-700 mb-6 italic">"{result.summary}"</p>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 text-center">
                    <span className="block text-sm text-slate-500 mb-1">Protein</span>
                    <span className="block font-semibold text-slate-800">{result.macros.protein}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 text-center">
                    <span className="block text-sm text-slate-500 mb-1">Carbs</span>
                    <span className="block font-semibold text-slate-800">{result.macros.carbs}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 text-center">
                    <span className="block text-sm text-slate-500 mb-1">Fats</span>
                    <span className="block font-semibold text-slate-800">{result.macros.fat}</span>
                  </div>
                </div>
             </div>
             
             <button 
               onClick={reset}
               className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
             >
               Track Another Meal
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodTracker;
