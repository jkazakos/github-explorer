/**
 * Represents a GitHub User entity fetched from the REST API.
 */
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

/**
 * Represents a GitHub Repository entity fetched from the REST API.
 */
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

/**
 * Represents a brief GitHub Follower entity fetched from the REST API.
 */
export interface GitHubFollower {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
}

/**
 * Represents pagination information used to track subsequent pages of data.
 */
export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}
