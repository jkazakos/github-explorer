import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr]">
      <div className="h-120 animate-pulse rounded-2xl border border-white/5 bg-slate-900/50" />
      <div className="flex flex-col gap-6">
        <div className="h-13 animate-pulse rounded-xl border border-white/5 bg-slate-900/50" />
        <div className="h-95 animate-pulse rounded-2xl border border-white/5 bg-slate-900/50" />
      </div>
    </div>
  );
};
