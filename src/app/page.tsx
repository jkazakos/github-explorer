"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, BookOpen, GitFork, Users, AlertCircle } from "lucide-react";
import { GitHubUser, GitHubRepo, GitHubFollower, PageInfo } from "../types/github";
import { GithubIcon } from "../components/Icons";
import { LandingScreen } from "../components/LandingScreen";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { ProfileSidebar } from "../components/ProfileSidebar";
import { OverviewTab } from "../components/OverviewTab";
import { RepoTab } from "../components/RepoTab";
import { FollowerTab } from "../components/FollowersTab";
import { isValidUsername } from "../utils/usernameRegex";

export default function Dashboard() {
  const [searchVal, setSearchVal] = useState("");
  const [activeUsername, setActiveUsername] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [isClient, setIsClient] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSearchValChange = useCallback((val: string) => {
    setSearchVal(val);
    setValidationError(null);
  }, []);

  const activeTabRef = useRef(activeTab);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // Synchronize component state with URL query parameters
  useEffect(() => {
    const syncFromUrl = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const userParam = params.get("username") || "";
        const VALID_TABS = ["overview", "repos", "followers"];
        const tabParam = params.get("tab") || "overview";

        setActiveUsername(userParam);
        setSearchVal(userParam);
        setActiveTab(VALID_TABS.includes(tabParam) ? tabParam : "overview");
      }
    };

    // Run on mount (wrapped to prevent synchronous setState warning)
    requestAnimationFrame(() => {
      setIsClient(true);
      syncFromUrl();
    });

    // Run on popstate (browser back/forward navigation)
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  // Sync state modifications back to the URL search params
  const updateUrlParams = useCallback((username: string, tab: string) => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (username) {
        params.set("username", username);
      } else {
        params.delete("username");
      }
      params.set("tab", tab);

      const newUrl = username
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;

      window.history.pushState({}, "", newUrl);
    }
  }, []);

  // Trigger search execution
  const executeSearch = useCallback(
    (usernameToSearch: string) => {
      const trimmed = usernameToSearch.trim();
      if (!trimmed) return;

      if (!isValidUsername(trimmed)) {
        setValidationError(
          "Invalid GitHub username format. Usernames may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.",
        );
        return;
      }

      setValidationError(null);
      setActiveUsername(trimmed);
      setSearchVal(trimmed);
      updateUrlParams(trimmed, activeTabRef.current);
    },
    [updateUrlParams],
  );

  const handleSearchSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    executeSearch(searchVal);
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    updateUrlParams(activeUsername, newTab);
  };

  // Fetch GitHub Data (GraphQL)
  const {
    data: githubData,
    isLoading,
    error,
    refetch: refetchProfile,
  } = useQuery<
    {
      profile: GitHubUser;
      repos: GitHubRepo[];
      followers: GitHubFollower[];
      repoPageInfo: PageInfo;
      followerPageInfo: PageInfo;
    } | null,
    Error
  >({
    queryKey: ["github_data", activeUsername],
    queryFn: async ({ signal }) => {
      if (!activeUsername) return null;
      const res = await fetch(
        `/api/github?username=${encodeURIComponent(activeUsername)}`,
        { signal },
      );
      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(
          errorJson.error || `HTTP ${res.status}: Failed to fetch data`,
        );
      }
      return res.json();
    },
    enabled: !!activeUsername,
  });

  const profile = githubData?.profile || null;
  const repos = githubData?.repos || null;
  const followers = githubData?.followers || null;
  const repoPageInfo = githubData?.repoPageInfo || null;
  const followerPageInfo = githubData?.followerPageInfo || null;

  if (!isClient) {
    return (
      <div className="max-w-7xl w-full mx-auto px-4 py-8 md:px-6 lg:px-8 flex flex-col gap-8 flex-1 items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full mx-auto px-4 py-8 md:px-6 lg:px-8 flex flex-col gap-8 flex-1">
      {/* Header section (Visible once active search is initialized) */}
      {activeUsername && (
        <header className="flex flex-col items-center gap-6 md:flex-row md:justify-between md:items-center border-b border-white/5 pb-4">
          <div
            role="button"
            tabIndex={0}
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => {
              setActiveUsername("");
              handleSearchValChange("");
              updateUrlParams("", "overview");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveUsername("");
                handleSearchValChange("");
                updateUrlParams("", "overview");
              }
            }}
          >
            <GithubIcon
              size={32}
              className="text-accent transition-transform group-hover:scale-105"
            />
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-clip-text">
                GitHub Explorer
              </h1>
            </div>
          </div>

          <div className="flex flex-col w-full max-w-md gap-2">
            <form
              onSubmit={handleSearchSubmit}
              className="flex w-full gap-2 bg-slate-900/60 border border-white/5 p-2 rounded-2xl focus-within:border-accent/40"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3.5 text-muted" size={18} />
                <input
                  type="text"
                  maxLength={39}
                  aria-label="Search GitHub username"
                  placeholder="GitHub username..."
                  className="w-full text-xs md:text-sm pl-10 pr-4 py-2.5 bg-transparent border-0 placeholder-text-muted focus:outline-none"
                  value={searchVal}
                  onChange={(e) => handleSearchValChange(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="flex text-xs md:text-sm lg:text-base items-center gap-2 px-6 bg-accent font-semibold rounded-xl hover:-translate-y-0.5 active:translate-y-0 transition-all whitespace-nowrap cursor-pointer"
              >
                Search
              </button>
            </form>
            {validationError && (
              <p className="text-red-500 text-xs pl-2 text-left animate-fade-in font-medium leading-normal">
                <AlertCircle
                  size={14}
                  className="inline-block mr-1.5 align-text-bottom"
                />
                {validationError}
              </p>
            )}
          </div>
        </header>
      )}

      {/* Landing Screen */}
      {!activeUsername && (
        <LandingScreen
          searchVal={searchVal}
          setSearchVal={handleSearchValChange}
          executeSearch={executeSearch}
          validationError={validationError}
        />
      )}

      {/* Loading State */}
      {activeUsername && isLoading && <LoadingState />}

      {/* Error State */}
      {activeUsername && !isLoading && error && (
        <ErrorState
          activeUsername={activeUsername}
          error={error}
          refetchProfile={refetchProfile}
        />
      )}

      {/* 4. Main Dashboard UI (Success State) */}
      {activeUsername && !isLoading && !error && profile && (
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-start animate-fade-in">
          {/* Profile Sidebar */}
          <ProfileSidebar profile={profile} />

          {/* Main Content Area */}
          <main className="flex flex-col gap-6">
            <nav
              role="tablist"
              aria-label="Profile navigation"
              className="flex bg-slate-900/50 border border-white/5 rounded-xl p-1 gap-1 shadow-md"
            >
              <button
                id="tab-overview"
                role="tab"
                aria-selected={activeTab === "overview"}
                aria-controls="panel-overview"
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-lg font-semibold text-xs sm:text-sm hover:text-slate-100 transition-all cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-slate-800 shadow-sm"
                    : "text-muted hover:bg-slate-800/40"
                }`}
                onClick={() => handleTabChange("overview")}
              >
                <BookOpen size={16} />
                <span>Overview</span>
              </button>
              <button
                id="tab-repos"
                role="tab"
                aria-selected={activeTab === "repos"}
                aria-controls="panel-repos"
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-lg font-semibold text-xs sm:text-sm hover:text-slate-100 transition-all cursor-pointer ${
                  activeTab === "repos"
                    ? "bg-slate-800 shadow-sm"
                    : "text-muted hover:bg-slate-800/40"
                }`}
                onClick={() => handleTabChange("repos")}
              >
                <GitFork size={16} />
                <span className="hidden sm:inline">Repositories</span>
                <span className="inline sm:hidden">Repos</span>
                <span
                  className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold font-mono ${
                    activeTab === "repos"
                      ? "bg-accent"
                      : "bg-white/5 text-muted"
                  }`}
                >
                  {profile.public_repos}
                </span>
              </button>
              <button
                id="tab-followers"
                role="tab"
                aria-selected={activeTab === "followers"}
                aria-controls="panel-followers"
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-lg font-semibold text-xs sm:text-sm hover:text-slate-100 transition-all cursor-pointer ${
                  activeTab === "followers"
                    ? "bg-slate-800 shadow-sm"
                    : "text-muted hover:bg-slate-800/40"
                }`}
                onClick={() => handleTabChange("followers")}
              >
                <Users size={16} />
                <span>Followers</span>
                <span
                  className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold font-mono ${
                    activeTab === "followers"
                      ? "bg-accent"
                      : "bg-white/5 text-muted"
                  }`}
                >
                  {profile.followers}
                </span>
              </button>
            </nav>

            {/* Tab Panel: Overview */}
            <div
              id="panel-overview"
              role="tabpanel"
              aria-labelledby="tab-overview"
              className={activeTab === "overview" ? "block" : "hidden"}
              aria-hidden={activeTab !== "overview"}
            >
              <OverviewTab profile={profile} repos={repos} />
            </div>

            {/* Tab Panel: Repositories */}
            {repos && repoPageInfo && profile && (
              <div
                id="panel-repos"
                role="tabpanel"
                aria-labelledby="tab-repos"
                className={activeTab === "repos" ? "block" : "hidden"}
                aria-hidden={activeTab !== "repos"}
              >
                <RepoTab
                  key={activeUsername}
                  repos={repos}
                  pageInfo={repoPageInfo}
                  username={profile.login}
                />
              </div>
            )}

            {/* Tab Panel: Followers */}
            {followerPageInfo && profile && (
              <div
                id="panel-followers"
                role="tabpanel"
                aria-labelledby="tab-followers"
                className={activeTab === "followers" ? "block" : "hidden"}
                aria-hidden={activeTab !== "followers"}
              >
                <FollowerTab
                  key={activeUsername}
                  followers={followers}
                  totalCount={profile.followers}
                  executeSearch={executeSearch}
                  pageInfo={followerPageInfo}
                  username={profile.login}
                />
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
