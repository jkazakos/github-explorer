import React from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { GithubIcon } from './Icons';

interface LandingScreenProps {
  searchVal: string;
  setSearchVal: (val: string) => void;
  executeSearch: (username: string) => void;
  validationError: string | null;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  searchVal,
  setSearchVal,
  executeSearch,
  validationError,
}) => {
  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    executeSearch(searchVal);
  };

  return (
    <div className="animate-fade-in mx-auto my-24 flex max-w-7xl flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="relative mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
        <GithubIcon size={44} className="text-accent" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
          GitHub Explorer
        </h1>
        <p className="mt-2.5 text-sm text-muted md:text-base lg:text-lg">
          Explore GitHub profiles. Retrieve user metadata, public repositories, and follower
          networks instantly.
        </p>
      </div>

      <div className="flex w-full max-w-xl flex-col gap-2">
        <form
          onSubmit={handleSubmit}
          className="flex w-full gap-2 rounded-2xl border border-white/5 bg-slate-900/60 p-2 focus-within:border-accent/40"
        >
          <div className="relative flex flex-1 items-center">
            <Search className="absolute left-3.5 text-muted" size={20} />
            <input
              type="text"
              maxLength={39}
              aria-label="Search GitHub username"
              placeholder="GitHub username..."
              className="placeholder-text-muted w-full border-0 bg-transparent py-3 pr-4 pl-12 text-xs focus:outline-none md:text-base"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-6 text-xs font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5 active:translate-y-0 md:text-base"
          >
            Search
          </button>
        </form>
        {validationError && (
          <p className="animate-fade-in pl-2 text-left text-xs text-red-500 md:text-sm lg:text-base">
            <AlertCircle size={18} className="mr-1.5 inline-block align-text-bottom" />
            {validationError}
          </p>
        )}
      </div>
    </div>
  );
};
