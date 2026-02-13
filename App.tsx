import React, { useState, useEffect } from 'react';
import { auth } from './services/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import FoodTracker from './components/FoodTracker';
import WorkoutTracker from './components/WorkoutTracker';
import Login from './components/Login';
import { AppView } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      // If logging out, reset view
      if (!currentUser) {
        setCurrentView(AppView.LOGIN);
      } else if (currentView === AppView.LOGIN) {
        setCurrentView(AppView.DASHBOARD);
      }
    });
    return () => unsubscribe();
  }, [currentView]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar 
        currentView={currentView} 
        setView={setCurrentView} 
        userEmail={user.email} 
      />
      
      <main className="flex-grow">
        {currentView === AppView.DASHBOARD && <Dashboard setView={setCurrentView} userId={user.uid} />}
        {currentView === AppView.FOOD_TRACKER && <FoodTracker userId={user.uid} setView={setCurrentView} />}
        {currentView === AppView.WORKOUT_TRACKER && <WorkoutTracker userId={user.uid} setView={setCurrentView} />}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} NutriAI. Powered by Google Gemini.
        </div>
      </footer>
    </div>
  );
};

export default App;
