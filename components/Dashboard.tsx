import React, { useEffect, useState } from 'react';
import { AppView, LogEntry } from '../types';
import { getTodayLogs, getUserStats, deleteLog } from '../services/storage';

interface DashboardProps {
  setView: (view: AppView) => void;
  userId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ setView, userId }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState({ eaten: 0, burned: 0, bmr: 0, balance: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch both in parallel for speed
      const [todayLogs, userStats] = await Promise.all([
        getTodayLogs(userId),
        getUserStats(userId)
      ]);
      
      const eaten = todayLogs
        .filter(l => l.type === 'FOOD')
        .reduce((acc, curr) => acc + curr.calories, 0);
        
      const burned = todayLogs
        .filter(l => l.type === 'WORKOUT')
        .reduce((acc, curr) => acc + curr.calories, 0);

      // Balance = Eaten - (BMR + Exercise)
      const balance = eaten - (userStats.tmb + burned);

      setLogs(todayLogs);
      setStats({
        eaten,
        burned,
        bmr: userStats.tmb,
        balance
      });
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleDelete = async (logId: string) => {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      await deleteLog(userId, logId);
      loadData();
    }
  };

  const getBalanceColor = (balance: number) => {
    if (balance < -500) return 'text-blue-600'; 
    if (balance > 500) return 'text-red-600';   
    return 'text-emerald-600'; 
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Stats */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Resumo do Dia</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <p className="text-xs text-slate-500 uppercase font-semibold">Ingeridas</p>
            <p className="text-2xl font-bold text-slate-800">{stats.eaten} <span className="text-sm font-normal text-slate-400">kcal</span></p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
             <p className="text-xs text-slate-500 uppercase font-semibold">Basal (TMB)</p>
             <p className="text-2xl font-bold text-slate-800">{stats.bmr} <span className="text-sm font-normal text-slate-400">kcal</span></p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
             <p className="text-xs text-slate-500 uppercase font-semibold">Exercício</p>
             <p className="text-2xl font-bold text-orange-600">{stats.burned} <span className="text-sm font-normal text-slate-400">kcal</span></p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
             <p className="text-xs text-slate-500 uppercase font-semibold">Saldo</p>
             <p className={`text-2xl font-bold ${getBalanceColor(stats.balance)}`}>
               {stats.balance > 0 ? '+' : ''}{stats.balance} <span className="text-sm font-normal text-slate-400">kcal</span>
             </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Actions Column */}
        <div className="md:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-slate-700">Ações Rápidas</h2>
          
          <div 
            onClick={() => setView(AppView.FOOD_TRACKER)}
            className="bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow border border-slate-100 flex items-center group"
          >
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-4 group-hover:bg-orange-200 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Registrar Refeição</h3>
              <p className="text-xs text-slate-500">Foto ou texto</p>
            </div>
          </div>

          <div 
            onClick={() => setView(AppView.WORKOUT_TRACKER)}
            className="bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow border border-slate-100 flex items-center group"
          >
             <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Registrar Treino</h3>
              <p className="text-xs text-slate-500">Calculadora de queima</p>
            </div>
          </div>
        </div>

        {/* History Column */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-bold text-slate-700 mb-4">Histórico de Hoje</h2>
          
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
                Nenhum registro hoje. Comece adicionando uma refeição!
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-4 ${log.type === 'FOOD' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                      {log.type === 'FOOD' ? (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      ) : (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{log.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{log.details}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`font-bold mr-4 ${log.type === 'FOOD' ? 'text-slate-700' : 'text-orange-600'}`}>
                      {log.type === 'WORKOUT' ? '-' : '+'}{log.calories}
                    </span>
                    <button 
                      onClick={() => handleDelete(log.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
