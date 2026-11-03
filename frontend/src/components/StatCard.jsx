import React from 'react';

const StatCard = ({ title, value, icon: Icon, change, changeType = 'positive', color = 'indigo' }) => {
  const colorMap = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <h4 className="text-2xl font-bold text-white mt-1.5">{value}</h4>
        </div>
        <div className={`p-3 rounded-xl border ${colorMap[color] || colorMap.indigo}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
      {change && (
        <div className="mt-3 flex items-center text-xs">
          <span className={changeType === 'positive' ? 'text-emerald-400' : 'text-slate-400'}>
            {change}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;

