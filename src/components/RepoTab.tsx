import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, BookOpen, GitFork, Star, ChevronDown } from "lucide-react";
import { GitHubRepo, PageInfo } from "../types/github";
import { getLanguageColor } from "../utils/languageColors";
import { formatDate } from "../utils/formatDate";

interface RepoTabProps {
  repos: GitHubRepo[];
  pageInfo: PageInfo;
  username: string;
}

export const RepoTab = React.memo(function RepoTab({
  repos: initialRepos,
  pageInfo: initialPageInfo,
  username,
}: RepoTabProps) {
  const [repoSearch, setRepoSearch] = useState("");
  const [repoSort, setRepoSort] = useState("stars-desc");
  const [repos, setRepos] = useState<GitHubRepo[]>(initialRepos);
  const [pageInfo, setPageInfo] = useState<PageInfo>(initialPageInfo);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchMore = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.blur();
    if (!pageInfo.hasNextPage || !pageInfo.endCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    setLoadMoreError(null);

    // Capture current scroll position to prevent browser from auto-scrolling
    const currentScrollY = window.scrollY;

    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch(
        `/api/github/repos?username=${encodeURIComponent(username)}&cursor=${encodeURIComponent(pageInfo.endCursor)}`,
        { signal: abortControllerRef.current.signal },
      );
      if (!res.ok) throw new Error("Failed to fetch more");
      const data = await res.json();

      setRepos((prev) => {
        const existingIds = new Set(prev.map((r) => r.id));
        const newRepos = data.repos.filter(
          (r: GitHubRepo) => !existingIds.has(r.id),
        );
        return [...prev, ...newRepos];
      });
      setPageInfo(data.pageInfo);

      // Restore scroll position right after DOM update
      requestAnimationFrame(() => {
        window.scrollTo({
          top: currentScrollY,
          behavior: "instant" as ScrollBehavior,
        });
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        // Ignore abort errors
      } else {
        console.error(err instanceof Error ? err.message : String(err));
        setLoadMoreError("Failed to load more. Please try again.");
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  const sortedAndFilteredRepos = useMemo(() => {
    let filtered = [...repos];
    if (repoSearch.trim()) {
      const q = repoSearch.toLowerCase();
      filtered = filtered.filter(
        (repo) =>
          repo.name.toLowerCase().includes(q) ||
          (repo.description && repo.description.toLowerCase().includes(q)),
      );
    }

    if (repoSort === "stars-desc") {
      filtered.sort((a, b) => b.stargazers_count - a.stargazers_count);
    } else if (repoSort === "stars-asc") {
      filtered.sort((a, b) => a.stargazers_count - b.stargazers_count);
    } else if (repoSort === "name-desc") {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (repoSort === "name-asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (repoSort === "updated") {
      filtered.sort((a, b) => {
        const timeA = a.pushed_at ? new Date(a.pushed_at).getTime() : 0;
        const timeB = b.pushed_at ? new Date(b.pushed_at).getTime() : 0;
        return timeB - timeA;
      });
    }

    return filtered;
  }, [repos, repoSearch, repoSort]);

  return (
    <section className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center pb-2 border-b border-white/5 mb-2">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            size={16}
          />
          <input
            type="text"
            placeholder="Find a repository..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800/60 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
            value={repoSearch}
            onChange={(e) => setRepoSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-muted whitespace-nowrap">Sort by:</span>
          <div className="relative flex items-center">
            <select
              className="appearance-none pl-3 pr-10 py-2 bg-slate-800/60 border border-white/5 rounded-xl text-sm cursor-pointer min-w-35 focus:outline-none focus:border-accent"
              value={repoSort}
              onChange={(e) => setRepoSort(e.target.value)}
            >
              <option value="stars-desc">Most Stars</option>
              <option value="stars-asc">Fewest Stars</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="updated">Recently Updated</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              size={16}
            />
          </div>
        </div>
      </div>

      {sortedAndFilteredRepos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center text-muted">
          <BookOpen size={40} className="text-muted" />
          <div className="text-base font-semibold">No repositories found</div>
          <p className="max-w-xs text-xs text-muted">
            {repoSearch
              ? `No public repositories matched your filter "${repoSearch}".`
              : "This user does not have any public repositories."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-muted">
            Showing {sortedAndFilteredRepos.length} repositories
          </p>
          {sortedAndFilteredRepos.map((repo) => (
            <div
              key={repo.id}
              className="border border-white/5 bg-slate-900/30 rounded-xl p-5 hover:border-accent/30 hover:bg-slate-900/60 transition-all duration-300 flex flex-col gap-3"
            >
              <div className="flex justify-between items-start gap-4">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-semibold hover:text-accent transition-colors flex items-center gap-2 break-all"
                >
                  <GitFork size={16} /> {repo.name}
                </a>
                {repo.stargazers_count > 0 && (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Star size={12} fill="currentColor" />
                    <span>{repo.stargazers_count}</span>
                  </span>
                )}
              </div>

              <p className="text-sm text-muted">
                {repo.description || <i>No description provided.</i>}
              </p>

              <div className="flex items-center gap-4 text-xs text-muted flex-wrap">
                {repo.language && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: getLanguageColor(repo.language),
                      }}
                    />
                    <span>{repo.language}</span>
                  </div>
                )}

                {repo.license && <span>{repo.license.name}</span>}
                <span>
                  {repo.pushed_at
                    ? `Updated ${formatDate(repo.pushed_at)}`
                    : "No recent updates"}
                </span>
              </div>
            </div>
          ))}
          {loadMoreError && (
            <div className="mt-4 text-center text-sm font-semibold text-red-400 bg-red-400/10 border border-red-400/20 py-2.5 rounded-xl">
              {loadMoreError}
            </div>
          )}
          {pageInfo.hasNextPage && (
            <button
              type="button"
              onClick={fetchMore}
              disabled={isLoadingMore}
              className="mt-4 py-2.5 px-4 bg-slate-800/60 hover:bg-slate-800 border border-white/5 rounded-xl text-sm font-semibold text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? "Loading..." : "Load More"}
            </button>
          )}
        </div>
      )}
    </section>
  );
});
