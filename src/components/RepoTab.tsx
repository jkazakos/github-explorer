import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, BookOpen, GitFork, Star, ChevronDown } from 'lucide-react';
import { type GitHubRepo, type PageInfo } from '../types/github';
import { getLanguageColor } from '../utils/languageColors';
import { formatDate } from '../utils/formatDate';

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
  const [repoSearch, setRepoSearch] = useState('');
  const [repoSort, setRepoSort] = useState('stars-desc');
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
      if (!res.ok) throw new Error('Failed to fetch more');
      const data = await res.json();

      setRepos((prev) => {
        const existingIds = new Set(prev.map((r) => r.id));
        const newRepos = data.repos.filter((r: GitHubRepo) => !existingIds.has(r.id));
        return [...prev, ...newRepos];
      });
      setPageInfo(data.pageInfo);

      // Restore scroll position right after DOM update
      requestAnimationFrame(() => {
        window.scrollTo({
          top: currentScrollY,
          behavior: 'instant' as ScrollBehavior,
        });
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Ignore abort errors
      } else {
        console.error(err instanceof Error ? err.message : String(err));
        setLoadMoreError('Failed to load more. Please try again.');
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

    if (repoSort === 'stars-desc') {
      filtered.sort((a, b) => b.stargazers_count - a.stargazers_count);
    } else if (repoSort === 'stars-asc') {
      filtered.sort((a, b) => a.stargazers_count - b.stargazers_count);
    } else if (repoSort === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (repoSort === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (repoSort === 'updated') {
      filtered.sort((a, b) => {
        const timeA = a.pushed_at ? new Date(a.pushed_at).getTime() : 0;
        const timeB = b.pushed_at ? new Date(b.pushed_at).getTime() : 0;
        return timeB - timeA;
      });
    }

    return filtered;
  }, [repos, repoSearch, repoSort]);

  return (
    <section className="animate-fade-in rounded-2xl border border-white/5 bg-slate-900/50 p-6">
      <div className="mb-2 flex flex-col gap-4 border-b border-white/5 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full flex-1 sm:max-w-sm">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text"
            placeholder="Find a repository..."
            className="w-full rounded-xl border border-white/5 bg-slate-800/60 py-2 pr-4 pl-9 text-sm transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
            value={repoSearch}
            onChange={(e) => setRepoSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs whitespace-nowrap text-muted">Sort by:</span>
          <div className="relative flex items-center">
            <select
              className="min-w-35 cursor-pointer appearance-none rounded-xl border border-white/5 bg-slate-800/60 py-2 pr-10 pl-3 text-sm focus:border-accent focus:outline-none"
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
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted"
              size={16}
            />
          </div>
        </div>
      </div>

      {sortedAndFilteredRepos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center text-muted">
          <BookOpen size={40} className="text-muted" />
          <div className="text-base font-semibold">No repositories found</div>
          <p className="max-w-xs text-xs text-muted">
            {repoSearch
              ? `No public repositories matched your filter "${repoSearch}".`
              : 'This user does not have any public repositories.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-muted">Showing {sortedAndFilteredRepos.length} repositories</p>
          {sortedAndFilteredRepos.map((repo) => (
            <div
              key={repo.id}
              className="flex flex-col gap-3 rounded-xl border border-white/5 bg-slate-900/30 p-5 transition-all duration-300 hover:border-accent/30 hover:bg-slate-900/60"
            >
              <div className="flex items-start justify-between gap-4">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-base font-semibold break-all transition-colors hover:text-accent"
                >
                  <GitFork size={16} /> {repo.name}
                </a>
                {repo.stargazers_count > 0 && (
                  <span className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-500">
                    <Star size={12} fill="currentColor" />
                    <span>{repo.stargazers_count}</span>
                  </span>
                )}
              </div>

              <p className="text-sm text-muted">
                {repo.description || <i>No description provided.</i>}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                {repo.language && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: getLanguageColor(repo.language),
                      }}
                    />
                    <span>{repo.language}</span>
                  </div>
                )}

                {repo.license && <span>{repo.license.name}</span>}
                <span>
                  {repo.pushed_at ? `Updated ${formatDate(repo.pushed_at)}` : 'No recent updates'}
                </span>
              </div>
            </div>
          ))}
          {loadMoreError && (
            <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 py-2.5 text-center text-sm font-semibold text-red-400">
              {loadMoreError}
            </div>
          )}
          {pageInfo.hasNextPage && (
            <button
              type="button"
              onClick={fetchMore}
              disabled={isLoadingMore}
              className="mt-4 rounded-xl border border-white/5 bg-slate-800/60 px-4 py-2.5 text-center text-sm font-semibold transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoadingMore ? 'Loading...' : 'Load More'}
            </button>
          )}
        </div>
      )}
    </section>
  );
});
