import React, { useState, useEffect } from 'react';
import { ViewState, LogEntry, UserProfile } from './types';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { FoodInput } from './components/FoodInput';
import { WorkoutInput } from './components/WorkoutInput';
import { Login } from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { subscribeToLogs, addLogEntry, saveUserProfile, getUserProfile } from './services/dbService';

const AuthenticatedApp: React.FC = () => {
  const { user, logout } = useAuth();
  const [view, setView] = useState<ViewState>('dashboard');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({ weight: 70, height: 175, tmb: 1600 });
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load Profile and Subscribe to Logs on mount
  useEffect(() => {
    if (!user) return;

    // 1. Fetch Profile
    getUserProfile(user.uid).then((profile) => {
      if (profile) setUserProfile(profile);
      setDataLoaded(true);
    });

    // 2. Subscribe to Logs
    const unsubscribe = subscribeToLogs(user.uid, (newLogs) => {
      setLogs(newLogs);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddLog = async (log: LogEntry) => {
    if (user) {
        // Optimistic update (optional, but Firestore listener is fast enough usually)
        await addLogEntry(user.uid, log);
        setView('dashboard');
    }
  };

  const handleUpdateProfile = async (profile: UserProfile) => {
    setUserProfile(profile); // Local update
    if (user) {
        await saveUserProfile(user.uid, profile); // Cloud update
    }
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard logs={logs} userProfile={userProfile} />;
      case 'food':
        return <FoodInput onAddLog={handleAddLog} onCancel={() => setView('dashboard')} />;
      case 'workout':
        return (
          <WorkoutInput 
            userProfile={userProfile} 
            onUpdateProfile={handleUpdateProfile}
            onAddLog={handleAddLog} 
            onCancel={() => setView('dashboard')} 
          />
        );
      default:
        return <Dashboard logs={logs} userProfile={userProfile} />;
    }
  };

  if (!dataLoaded) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
             <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
             </div>
        </div>
     )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative flex flex-col">
        
        {/* Top Bar */}
        <div className="px-6 py-5 flex justify-between items-center bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
                N
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Nutri<span className="text-emerald-600">AI</span></h1>
          </div>
          <button 
            onClick={logout}
            className="text-xs text-gray-400 font-medium px-2 py-1 hover:bg-gray-100 hover:text-red-500 transition-colors rounded-md"
          >
            Sair
          </button>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 px-6 pt-2 pb-24 overflow-y-auto scrollbar-hide">
          {renderView()}
        </main>

        {/* Navigation */}
        <Navigation activeView={view} onNavigate={setView} />
        
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
           <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
    );
  }

  return user ? <AuthenticatedApp /> : <Login />;
};

export default () => (
    <AuthProvider>
        <App />
    </AuthProvider>
);
