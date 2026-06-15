export interface GraphQLRepoNode {
  databaseId: number;
  name: string;
  url: string;
  description: string | null;
  stargazerCount: number;
  primaryLanguage: { name: string } | null;
  pushedAt: string;
  licenseInfo: { name: string } | null;
}

export interface GraphQLFollowerNode {
  login: string;
  databaseId: number;
  avatarUrl: string;
  url: string;
  name: string | null;
}

export interface GraphQLError {
  type: string;
  message: string;
}

export interface RestFollower {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name?: string | null;
}

export interface GraphQLBatchUserName {
  login: string;
  name: string | null;
}
