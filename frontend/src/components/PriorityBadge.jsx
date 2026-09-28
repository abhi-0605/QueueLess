import React from 'react';

export const PriorityBadge = ({ score }) => {
  if (!score || score === 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400">
        Standard
      </span>
    );
  }

  if (score >= 200) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-rose-950/80 border border-rose-800 text-rose-300 font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
        High Priority (+{score})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-amber-950/80 border border-amber-800 text-amber-300 font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      Priority (+{score})
    </span>
  );
};
