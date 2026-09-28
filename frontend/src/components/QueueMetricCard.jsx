import React from 'react';

export const QueueMetricCard = ({ label, value, subtext, accent = 'neutral', icon }) => {
  const accentClasses = {
    neutral: 'border-zinc-800 text-zinc-100',
    amber: 'border-amber-900/60 text-amber-400',
    emerald: 'border-emerald-900/60 text-emerald-400',
    blue: 'border-sky-900/60 text-sky-400'
  };

  return (
    <div className={`bg-zinc-900/90 border ${accentClasses[accent] || accentClasses.neutral} p-4 rounded-lg flex flex-col justify-between shadow-sm`}>
      <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
        <span>{label}</span>
        {icon && <span className="opacity-70">{icon}</span>}
      </div>
      <div>
        <div className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-zinc-100">
          {value ?? '—'}
        </div>
        {subtext && (
          <p className="text-xs text-zinc-400 mt-1 font-mono">{subtext}</p>
        )}
      </div>
    </div>
  );
};
