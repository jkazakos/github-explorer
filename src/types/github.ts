export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  type: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  pushed_at: string;
  license: { name: string } | null;
}

export interface GitHubFollower {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}
