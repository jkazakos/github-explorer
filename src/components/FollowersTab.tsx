import React, { useState, useMemo, useEffect, useRef } from "react";
import { Users, ChevronDown } from "lucide-react";
import Image from "next/image";
import { GitHubFollower, PageInfo } from "../types/github";
import { githubAvatarLoader } from "../utils/imageLoader";

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
  const [followers, setFollowers] = useState<GitHubFollower[]>(
    initialFollowers || [],
  );
  const [pageInfo, setPageInfo] = useState<PageInfo>(initialPageInfo);
  const [followerSort, setFollowerSort] = useState("default");
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
      if (!res.ok) throw new Error("Failed to fetch more");
      const data = await res.json();

      setFollowers((prev) => {
        const existingIds = new Set(prev.map((f) => f.id));
        const newFollowers = data.followers.filter(
          (f: GitHubFollower) => !existingIds.has(f.id),
        );
        return [...prev, ...newFollowers];
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

  const sortedFollowers = useMemo(() => {
    const list = [...followers];
    if (followerSort === "name-asc") {
      list.sort((a, b) => a.login.localeCompare(b.login));
    } else if (followerSort === "name-desc") {
      list.sort((a, b) => b.login.localeCompare(a.login));
    }
    return list;
  }, [followers, followerSort]);

  return (
    <section className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center pb-2 border-b border-white/5 mb-4">
        <div className="text-sm">
          Total Followers: <strong>{totalCount}</strong>{" "}
          <span className="text-muted">(showing {followers.length})</span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-muted whitespace-nowrap">Sort by:</span>
          <div className="relative flex items-center">
            <select
              className="appearance-none pl-3 pr-10 py-2 bg-slate-800/60 border border-white/5 rounded-xl text-sm cursor-pointer min-w-35 focus:outline-none focus:border-accent"
              value={followerSort}
              onChange={(e) => setFollowerSort(e.target.value)}
            >
              <option value="default">Default (Oldest first)</option>
              <option value="name-asc">Username (A-Z)</option>
              <option value="name-desc">Username (Z-A)</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              size={16}
            />
          </div>
        </div>
      </div>

      {!followers || followers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center text-muted">
          <Users size={40} className="text-muted" />
          <div className="text-base font-semibold">No followers found</div>
          <p className="max-w-xs text-xs text-muted">
            This user does not have any public followers.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedFollowers.map((follower) => (
              <div
                key={follower.id}
                role="button"
                tabIndex={0}
                className="bg-slate-900/30 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-3 text-center hover:-translate-y-0.5 hover:border-accent/30 hover:bg-slate-900/60 cursor-pointer group transition-all duration-300"
                onClick={() => executeSearch(follower.login)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
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
                    className="rounded-full border-2 border-white/5 group-hover:border-accent transition-colors block"
                  />
                ) : (
                  <div className="w-18.75 h-18.75 bg-slate-800 rounded-full border-2 border-white/5 group-hover:border-accent flex items-center justify-center text-muted font-bold text-xl transition-colors">
                    {(follower.login || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="w-full flex flex-col gap-0.5">
                  <div className="text-sm font-semibold break-all">
                    {follower.name || follower.login}
                  </div>
                  {follower.name && (
                    <div className="text-xs text-muted break-all">
                      {follower.login}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
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
