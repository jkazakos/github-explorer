import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

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
    error.message.includes("404") ||
    error.message.toLowerCase().includes("not found");

  return (
    <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center max-w-lg mx-auto my-16 shadow-lg animate-fade-in">
      <AlertCircle size={48} className="text-red-500" />
      <h2 className="text-lg font-bold">
        {isNotFound ? "GitHub Account Not Found" : "API Connection Failed"}
      </h2>
      <p className="text-sm text-muted leading-relaxed">
        {isNotFound
          ? `The username "${activeUsername}" does not exist on GitHub. Please check the spelling and try again.`
          : `An error occurred. You might have exceeded the unauthenticated rate limit. Please configure a token or try again later.`}
      </p>
      <button
        onClick={() => refetchProfile()}
        className="px-5 py-2.5 bg-slate-800 border border-white/5 rounded-xl font-semibold text-sm cursor-pointer hover:-translate-y-0.5 transition-all"
      >
        <span className="flex items-center gap-2">
          <RotateCcw size={16} /> Retry Request
        </span>
      </button>
    </div>
  );
};
