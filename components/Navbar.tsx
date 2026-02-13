import React from 'react';
import { AppView } from '../types';
import { auth } from '../services/firebase';

interface NavbarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  userEmail: string | null;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, userEmail }) => {
  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <nav className="bg-emerald-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => setView(AppView.DASHBOARD)}>
            <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-bold text-xl tracking-tight">NutriAI</span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <button 
                onClick={() => setView(AppView.FOOD_TRACKER)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === AppView.FOOD_TRACKER ? 'bg-emerald-700 text-white' : 'text-emerald-100 hover:bg-emerald-500'}`}
              >
                Alimentação
              </button>
              <button 
                onClick={() => setView(AppView.WORKOUT_TRACKER)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === AppView.WORKOUT_TRACKER ? 'bg-emerald-700 text-white' : 'text-emerald-100 hover:bg-emerald-500'}`}
              >
                Treino
              </button>
            </div>
          </div>

          <div className="flex items-center">
             <span className="hidden sm:block text-xs text-emerald-200 mr-4 truncate max-w-[150px]">{userEmail}</span>
             <button 
               onClick={handleSignOut}
               className="bg-emerald-800 hover:bg-emerald-900 text-white px-3 py-1 rounded text-sm transition-colors"
             >
               Sair
             </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Nav */}
      <div className="md:hidden flex justify-around bg-emerald-700 py-2">
        <button onClick={() => setView(AppView.DASHBOARD)} className={`p-2 ${currentView === AppView.DASHBOARD ? 'text-white' : 'text-emerald-300'}`}>
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        </button>
        <button onClick={() => setView(AppView.FOOD_TRACKER)} className={`p-2 ${currentView === AppView.FOOD_TRACKER ? 'text-white' : 'text-emerald-300'}`}>
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
        </button>
        <button onClick={() => setView(AppView.WORKOUT_TRACKER)} className={`p-2 ${currentView === AppView.WORKOUT_TRACKER ? 'text-white' : 'text-emerald-300'}`}>
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
