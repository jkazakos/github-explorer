import React from 'react';
import { GitFork, Users, Briefcase, Info, Star } from 'lucide-react';
import { type GitHubUser, type GitHubRepo } from '../types/github';
import { getLanguageColor } from '../utils/languageColors';
import { formatDate } from '../utils/formatDate';

interface OverviewProps {
  profile: GitHubUser;
  repos: GitHubRepo[] | null | undefined;
}

export const OverviewTab = React.memo(function OverviewTab({ profile, repos }: OverviewProps) {
  return (
    <section className="animate-fade-in rounded-2xl border border-white/5 bg-slate-900/50 p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-xl border border-white/5 bg-slate-900/30 p-5">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-muted">
            <GitFork className="text-accent" size={18} />
            <span>Repositories</span>
          </div>
          <div className="text-2xl font-bold">{profile.public_repos}</div>
          <div className="text-xs text-muted">Total number of public repositories on GitHub</div>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-white/5 bg-slate-900/30 p-5">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-muted">
            <Users className="text-accent" size={18} />
            <span>Followers</span>
          </div>
          <div className="text-2xl font-bold">{profile.followers}</div>
          <div className="text-xs text-muted">Users following this account&apos;s activity</div>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-white/5 bg-slate-900/30 p-5">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-muted">
            <Info className="text-accent" size={18} />
            <span>Account Category</span>
          </div>
          <div className="text-2xl font-bold">{profile.type}</div>
          <div className="text-xs text-muted">GitHub entity classification type</div>
        </div>

        {profile.type !== 'Organization' && (
          <div className="flex flex-col gap-2 rounded-xl border border-white/5 bg-slate-900/30 p-5">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-muted">
              <Briefcase className="text-accent" size={18} />
              <span>Organization Member</span>
            </div>
            <div className="text-2xl font-bold">{profile.company ? 'Yes' : 'No'}</div>
            <div className="text-xs text-muted">
              Associated with a company or enterprise account
            </div>
          </div>
        )}
      </div>

      {repos && repos.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 text-sm font-bold tracking-wider uppercase">Featured Repositories</h3>
          <div className="flex flex-col gap-4">
            {[...repos]
              .sort((a, b) => b.stargazers_count - a.stargazers_count)
              .slice(0, 3)
              .map((repo) => (
                <div
                  key={repo.id}
                  className="flex flex-col gap-3 rounded-xl border border-white/5 bg-slate-900/30 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:bg-slate-900/60"
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
                    <span>
                      {repo.pushed_at
                        ? `Updated ${formatDate(repo.pushed_at)}`
                        : 'No recent updates'}
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
