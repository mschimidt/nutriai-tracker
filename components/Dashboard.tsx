import React from 'react';
import { LogEntry, UserProfile } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  logs: LogEntry[];
  userProfile: UserProfile;
}

export const Dashboard: React.FC<DashboardProps> = ({ logs, userProfile }) => {
  // Get today's logs
  const today = new Date().setHours(0, 0, 0, 0);
  const todaysLogs = logs.filter(log => new Date(log.timestamp).setHours(0, 0, 0, 0) === today);

  const totalIntake = todaysLogs
    .filter(l => l.type === 'food')
    .reduce((acc, curr) => acc + (curr.type === 'food' ? curr.calories : 0), 0);

  const totalBurned = todaysLogs
    .filter(l => l.type === 'workout')
    .reduce((acc, curr) => acc + (curr.type === 'workout' ? curr.caloriesBurned : 0), 0);
  
  // TMB is daily burn at rest
  const tmb = userProfile.tmb || 0;
  const netCalories = totalIntake - (totalBurned + tmb);
  
  const data = [
    { name: 'Ingerido', value: totalIntake, color: '#10b981' }, // emerald-500
    { name: 'Gasto (Treino)', value: totalBurned, color: '#f97316' }, // orange-500
    { name: 'Gasto (Basal)', value: tmb, color: '#3b82f6' }, // blue-500
  ];

  return (
    <div className="space-y-6 pb-20">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Seu Resumo Diário</h2>
        <p className="text-gray-500 text-sm">Balanço calórico de hoje</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Ingestão</p>
          <p className="text-2xl font-bold text-gray-900">{totalIntake} <span className="text-sm font-normal text-gray-400">kcal</span></p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Gasto Total</p>
          <p className="text-2xl font-bold text-gray-900">{totalBurned + tmb} <span className="text-sm font-normal text-gray-400">kcal</span></p>
        </div>
      </div>

      {/* Net Calculation */}
      <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl overflow-hidden relative">
        <div className="relative z-10">
            <p className="text-gray-400 text-sm font-medium mb-1">Balanço Líquido</p>
            <div className="flex items-baseline gap-2">
                <h3 className={`text-4xl font-bold ${netCalories > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {netCalories > 0 ? '+' : ''}{netCalories}
                </h3>
                <span className="text-lg text-gray-500">kcal</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
                {netCalories > 0 ? "Você está em superávit calórico." : "Você está em déficit calórico."}
            </p>
        </div>
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gray-800 rounded-full blur-xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-gray-800 rounded-full blur-xl opacity-50"></div>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-64">
         <h4 className="text-sm font-semibold text-gray-700 mb-4">Distribuição</h4>
         <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value} kcal`, '']} />
            </PieChart>
         </ResponsiveContainer>
         <div className="flex justify-center gap-4 text-xs text-gray-500 mt-[-20px]">
            {data.map(d => (
                <div key={d.name} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></span>
                    {d.name}
                </div>
            ))}
         </div>
      </div>

      {/* History List */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-3">Histórico de Hoje</h3>
        <div className="space-y-3">
          {todaysLogs.length === 0 ? (
            <p className="text-gray-400 text-center py-4 text-sm">Nenhum registro hoje.</p>
          ) : (
            todaysLogs.slice().reverse().map((log) => (
              <div key={log.id} className="flex items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 ${log.type === 'food' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                  {log.type === 'food' ? '🥗' : '🔥'}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{log.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`font-bold text-sm ${log.type === 'food' ? 'text-emerald-600' : 'text-orange-500'}`}>
                    {log.type === 'food' ? '+' : '-'}{log.type === 'food' ? log.calories : log.caloriesBurned}
                  </span>
                  <span className="text-xs text-gray-400 block">kcal</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
