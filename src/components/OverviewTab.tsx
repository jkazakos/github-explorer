import React from "react";
import { GitFork, Users, Briefcase, Info, Star } from "lucide-react";
import { GitHubUser, GitHubRepo } from "../types/github";
import { getLanguageColor } from "../utils/languageColors";
import { formatDate } from "../utils/formatDate";

interface OverviewProps {
  profile: GitHubUser;
  repos: GitHubRepo[] | null | undefined;
}

export const OverviewTab = React.memo(function OverviewTab({
  profile,
  repos,
}: OverviewProps) {
  return (
    <section className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900/30 border border-white/5 rounded-xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-muted">
            <GitFork className="text-accent" size={18} />
            <span>Repositories</span>
          </div>
          <div className="text-2xl font-bold">{profile.public_repos}</div>
          <div className="text-xs text-muted">
            Total number of public repositories on GitHub
          </div>
        </div>

        <div className="bg-slate-900/30 border border-white/5 rounded-xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-muted">
            <Users className="text-accent" size={18} />
            <span>Followers</span>
          </div>
          <div className="text-2xl font-bold">{profile.followers}</div>
          <div className="text-xs text-muted">
            Users following this account&apos;s activity
          </div>
        </div>

        <div className="bg-slate-900/30 border border-white/5 rounded-xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-muted">
            <Info className="text-accent" size={18} />
            <span>Account Category</span>
          </div>
          <div className="text-2xl font-bold">{profile.type}</div>
          <div className="text-xs text-muted">
            GitHub entity classification type
          </div>
        </div>

        {profile.type !== "Organization" && (
          <div className="bg-slate-900/30 border border-white/5 rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-muted">
              <Briefcase className="text-accent" size={18} />
              <span>Organization Member</span>
            </div>
            <div className="text-2xl font-bold">
              {profile.company ? "Yes" : "No"}
            </div>
            <div className="text-xs text-muted">
              Associated with a company or enterprise account
            </div>
          </div>
        )}
      </div>

      {repos && repos.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm uppercase tracking-wider font-bold mb-4">
            Featured Repositories
          </h3>
          <div className="flex flex-col gap-4">
            {[...repos]
              .sort((a, b) => b.stargazers_count - a.stargazers_count)
              .slice(0, 3)
              .map((repo) => (
                <div
                  key={repo.id}
                  className="border border-white/5 bg-slate-900/30 rounded-xl p-5 hover:-translate-y-0.5 hover:border-accent/30 hover:bg-slate-900/60 transition-all duration-300 flex flex-col gap-3"
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
                    <span>
                      {repo.pushed_at
                        ? `Updated ${formatDate(repo.pushed_at)}`
                        : "No recent updates"}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </section>
  );
});
