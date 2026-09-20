import React from 'react';
import { Building2, MapPin, Link, Calendar, ExternalLink } from 'lucide-react';
import { type GitHubUser } from '../types/github';
import { TwitterIcon } from './Icons';
import Image from 'next/image';
import { formatDate } from '../utils/formatDate';
import { githubAvatarLoader } from '../utils/imageLoader';

const getValidUrl = (url: string) => {
  try {
    const urlString = url.trim();
    const parsed = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    // Ignore invalid URLs
  }
  return null;
};

interface ProfileSidebarProps {
  profile: GitHubUser;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ profile }) => {
  return (
    <aside className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 rounded-2xl border border-white/5 bg-slate-900/50 p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative rounded-full p-1">
            {profile.avatar_url ? (
              <Image
                loader={githubAvatarLoader}
                src={profile.avatar_url}
                alt={`${profile.name || profile.login}'s avatar`}
                width={110}
                height={110}
                className="block rounded-full"
                priority
                loading="eager"
              />
            ) : (
              <div className="flex h-27.5 w-27.5 items-center justify-center rounded-full bg-slate-800 text-2xl font-bold text-muted">
                {(profile.name || profile.login || '?').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile.name || profile.login}</h2>
            <a
              href={profile.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-accent"
            >
              @{profile.login}
            </a>
          </div>
        </div>

        {profile.bio && <p className="text-center text-sm text-muted">{profile.bio}</p>}

        <div
          className={`grid ${profile.type === 'Organization' ? 'grid-cols-2' : 'grid-cols-3'} gap-2 border-y border-white/5 py-4`}
        >
          <div className="flex flex-col items-center gap-0.5 text-center">
            <span className="text-lg font-bold">{profile.public_repos}</span>
            <span className="text-xs font-semibold tracking-wider text-muted uppercase">
              Repositories
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5 text-center">
            <span className="text-lg font-bold">{profile.followers}</span>
            <span className="text-xs font-semibold tracking-wider text-muted uppercase">
              Followers
            </span>
          </div>
          {profile.type !== 'Organization' && (
            <div className="flex flex-col items-center gap-0.5 text-center">
              <span className="text-lg font-bold">{profile.following}</span>
              <span className="text-xs font-semibold tracking-wider text-muted uppercase">
                Following
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3.5 text-muted">
          {profile.company && (
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="shrink-0" size={16} />
              <span>{profile.company}</span>
            </div>
          )}
          {profile.location && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="shrink-0" size={16} />
              <span>{profile.location}</span>
            </div>
          )}
          {profile.blog && getValidUrl(profile.blog) && (
            <div className="flex items-center gap-3 text-sm">
              <Link className="shrink-0" size={16} />
              <a
                href={getValidUrl(profile.blog)!}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-accent"
              >
                {profile.blog.replace(/(^\w+:|^)\/\//, '')}
              </a>
            </div>
          )}
          {profile.twitter_username && (
            <div className="flex items-center gap-3 text-sm text-muted">
              <TwitterIcon className="shrink-0" size={16} />
              <a
                href={`https://twitter.com/${encodeURIComponent(profile.twitter_username)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-accent"
              >
                @{profile.twitter_username}
              </a>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm text-muted">
            <Calendar className="shrink-0" size={16} />
            <span>Joined {formatDate(profile.created_at)}</span>
          </div>
        </div>

        <a
          href={profile.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/5 bg-slate-800/40 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:bg-slate-800 active:translate-y-0"
        >
          <span>View on GitHub</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </aside>
  );
};
