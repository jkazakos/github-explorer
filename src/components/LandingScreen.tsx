import React from "react";
import { Search, AlertCircle } from "lucide-react";
import { GithubIcon } from "./Icons";

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
    <div className="flex flex-col items-center justify-center text-center max-w-7xl mx-auto my-24 gap-6 px-4 animate-fade-in">
      <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-2">
        <GithubIcon size={44} className="text-accent" />
      </div>
      <div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
          GitHub Explorer
        </h1>
        <p className="text-muted text-sm md:text-base lg:text-lg mt-2.5">
          Explore GitHub profiles. Retrieve user metadata, public repositories,
          and follower networks instantly.
        </p>
      </div>

      <div className="flex flex-col w-full max-w-xl gap-2">
        <form
          onSubmit={handleSubmit}
          className="flex w-full gap-2 p-2 bg-slate-900/60 border border-white/5 rounded-2xl focus-within:border-accent/40"
        >
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3.5 text-muted" size={20} />
            <input
              type="text"
              maxLength={39}
              aria-label="Search GitHub username"
              placeholder="GitHub username..."
              className="w-full text-xs md:text-base pl-12 pr-4 py-3 bg-transparent border-0 placeholder-text-muted focus:outline-none"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="flex text-xs md:text-base items-center gap-2 px-6 bg-accent font-semibold rounded-xl hover:-translate-y-0.5 active:translate-y-0 transition-all whitespace-nowrap cursor-pointer"
          >
            Search
          </button>
        </form>
        {validationError && (
          <p className="text-red-500 text-xs md:text-sm lg:text-base pl-2 text-left animate-fade-in">
            <AlertCircle
              size={18}
              className="inline-block mr-1.5 align-text-bottom"
            />
            {validationError}
          </p>
        )}
      </div>
    </div>
  );
};
