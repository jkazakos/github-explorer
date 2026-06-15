import React from "react";

export const LoadingState: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">
      <div className="animate-pulse bg-slate-900/50 border border-white/5 rounded-2xl h-120" />
      <div className="flex flex-col gap-6">
        <div className="animate-pulse bg-slate-900/50 border border-white/5 rounded-xl h-13" />
        <div className="animate-pulse bg-slate-900/50 border border-white/5 rounded-2xl h-95" />
      </div>
    </div>
  );
};
