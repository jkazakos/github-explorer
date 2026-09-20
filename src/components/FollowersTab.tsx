import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Users, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { type GitHubFollower, type PageInfo } from '../types/github';
import { githubAvatarLoader } from '../utils/imageLoader';

interface FollowerTabProps {
  followers: GitHubFollower[] | null | undefined;
  totalCount: number;
  executeSearch: (username: string) => void;
  pageInfo: PageInfo;
  username: string;
}

export const FollowerTab = React.memo(function FollowerTab({
  followers: initialFollowers,
  totalCount,
  executeSearch,
  pageInfo: initialPageInfo,
  username,
}: FollowerTabProps) {
  const [followers, setFollowers] = useState<GitHubFollower[]>(initialFollowers || []);
  const [pageInfo, setPageInfo] = useState<PageInfo>(initialPageInfo);
  const [followerSort, setFollowerSort] = useState('default');
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

    // Capture current scroll position
    const currentScrollY = window.scrollY;

    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch(
        `/api/github/followers?username=${encodeURIComponent(username)}&cursor=${encodeURIComponent(pageInfo.endCursor)}`,
        { signal: abortControllerRef.current.signal },
      );
      if (!res.ok) throw new Error('Failed to fetch more');
      const data = await res.json();

      setFollowers((prev) => {
        const existingIds = new Set(prev.map((f) => f.id));
        const newFollowers = data.followers.filter((f: GitHubFollower) => !existingIds.has(f.id));
        return [...prev, ...newFollowers];
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

  const sortedFollowers = useMemo(() => {
    const list = [...followers];
    if (followerSort === 'name-asc') {
      list.sort((a, b) => a.login.localeCompare(b.login));
    } else if (followerSort === 'name-desc') {
      list.sort((a, b) => b.login.localeCompare(a.login));
    }
    return list;
  }, [followers, followerSort]);

  return (
    <section className="animate-fade-in rounded-2xl border border-white/5 bg-slate-900/50 p-6">
      <div className="mb-4 flex flex-col gap-4 border-b border-white/5 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm">
          Total Followers: <strong>{totalCount}</strong>{' '}
          <span className="text-muted">(showing {followers.length})</span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs whitespace-nowrap text-muted">Sort by:</span>
          <div className="relative flex items-center">
            <select
              className="min-w-35 cursor-pointer appearance-none rounded-xl border border-white/5 bg-slate-800/60 py-2 pr-10 pl-3 text-sm focus:border-accent focus:outline-none"
              value={followerSort}
              onChange={(e) => setFollowerSort(e.target.value)}
            >
              <option value="default">Default (Oldest first)</option>
              <option value="name-asc">Username (A-Z)</option>
              <option value="name-desc">Username (Z-A)</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted"
              size={16}
            />
          </div>
        </div>
      </div>

      {!followers || followers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center text-muted">
          <Users size={40} className="text-muted" />
          <div className="text-base font-semibold">No followers found</div>
          <p className="max-w-xs text-xs text-muted">
            This user does not have any public followers.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
            {sortedFollowers.map((follower) => (
              <div
                key={follower.id}
                role="button"
                tabIndex={0}
                className="group flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-white/5 bg-slate-900/30 p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:bg-slate-900/60"
                onClick={() => executeSearch(follower.login)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    executeSearch(follower.login);
                  }
                }}
              >
                {follower.avatar_url ? (
                  <Image
                    loader={githubAvatarLoader}
                    src={follower.avatar_url}
                    alt={`${follower.login}'s avatar`}
                    width={75}
                    height={75}
                    className="block rounded-full border-2 border-white/5 transition-colors group-hover:border-accent"
                  />
                ) : (
                  <div className="flex h-18.75 w-18.75 items-center justify-center rounded-full border-2 border-white/5 bg-slate-800 text-xl font-bold text-muted transition-colors group-hover:border-accent">
                    {(follower.login || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex w-full flex-col gap-0.5">
                  <div className="text-sm font-semibold break-all">
                    {follower.name || follower.login}
                  </div>
                  {follower.name && (
                    <div className="text-xs break-all text-muted">{follower.login}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
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
