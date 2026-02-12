import React from 'react';
import { AppView } from '../types';

interface DashboardProps {
  setView: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Welcome to NutriAI</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Food Card */}
        <div 
          onClick={() => setView(AppView.FOOD_TRACKER)}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border border-slate-100 group"
        >
          <div className="h-40 bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
            <svg className="w-20 h-20 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Track Calories</h2>
            <p className="text-slate-600">
              Upload a photo of your meal or describe what you ate. AI will estimate your caloric intake and macros.
            </p>
            <span className="mt-4 inline-block text-orange-600 font-semibold group-hover:translate-x-1 transition-transform">Start Tracking &rarr;</span>
          </div>
        </div>

        {/* Workout Card */}
        <div 
          onClick={() => setView(AppView.WORKOUT_TRACKER)}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border border-slate-100 group"
        >
          <div className="h-40 bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <svg className="w-20 h-20 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Track Workouts</h2>
            <p className="text-slate-600">
              Send a photo of your treadmill, gym machine, or describe your workout. We'll calculate your burn based on your stats.
            </p>
            <span className="mt-4 inline-block text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">Start Tracking &rarr;</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
