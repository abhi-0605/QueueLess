import React from 'react';

const statusConfig = {
  WAITING: {
    label: 'WAITING',
    bg: 'bg-amber-950/60',
    text: 'text-amber-400',
    border: 'border-amber-800/80',
    dot: 'bg-amber-400'
  },
  CALLED: {
    label: 'CALLED',
    bg: 'bg-emerald-950/60',
    text: 'text-emerald-400',
    border: 'border-emerald-700',
    dot: 'bg-emerald-400 animate-ping'
  },
  IN_SERVICE: {
    label: 'IN SERVICE',
    bg: 'bg-emerald-900/50',
    text: 'text-emerald-300',
    border: 'border-emerald-600',
    dot: 'bg-emerald-300'
  },
  COMPLETED: {
    label: 'COMPLETED',
    bg: 'bg-zinc-900',
    text: 'text-zinc-400',
    border: 'border-zinc-700',
    dot: 'bg-zinc-500'
  },
  SKIPPED: {
    label: 'SKIPPED',
    bg: 'bg-orange-950/60',
    text: 'text-orange-400',
    border: 'border-orange-800',
    dot: 'bg-orange-400'
  },
  CANCELLED: {
    label: 'CANCELLED',
    bg: 'bg-rose-950/60',
    text: 'text-rose-400',
    border: 'border-rose-900',
    dot: 'bg-rose-500'
  },
  NO_SHOW: {
    label: 'NO SHOW',
    bg: 'bg-zinc-900',
    text: 'text-zinc-500',
    border: 'border-zinc-800',
    dot: 'bg-zinc-600'
  }
};

export const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || {
    label: status,
    bg: 'bg-zinc-900',
    text: 'text-zinc-300',
    border: 'border-zinc-800',
    dot: 'bg-zinc-400'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono font-semibold tracking-wider ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
