import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  activeUsername: string;
  error: Error;
  refetchProfile: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  activeUsername,
  error,
  refetchProfile,
}) => {
  const isNotFound =
    error.message.includes('404') || error.message.toLowerCase().includes('not found');

  return (
    <div className="animate-fade-in mx-auto my-16 flex max-w-lg flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/10 bg-red-500/5 p-8 text-center shadow-lg">
      <AlertCircle size={48} className="text-red-500" />
      <h2 className="text-lg font-bold">
        {isNotFound ? 'GitHub Account Not Found' : 'API Connection Failed'}
      </h2>
      <p className="text-sm leading-relaxed text-muted">
        {isNotFound
          ? `The username "${activeUsername}" does not exist on GitHub. Please check the spelling and try again.`
          : `An error occurred. You might have exceeded the unauthenticated rate limit. Please configure a token or try again later.`}
      </p>
      <button
        onClick={() => refetchProfile()}
        className="cursor-pointer rounded-xl border border-white/5 bg-slate-800 px-5 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5"
      >
        <span className="flex items-center gap-2">
          <RotateCcw size={16} /> Retry Request
        </span>
      </button>
    </div>
  );
};
