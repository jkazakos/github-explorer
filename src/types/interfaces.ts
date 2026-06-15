/**
 * Represents a Repository node within a GraphQL query response.
 */
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

/**
 * Represents a Follower node within a GraphQL query response.
 */
export interface GraphQLFollowerNode {
  login: string;
  databaseId: number;
  avatarUrl: string;
  url: string;
  name: string | null;
}

/**
 * Defines the structure of an error returned by the GraphQL API.
 */
export interface GraphQLError {
  type: string;
  message: string;
}

/**
 * Represents a follower specifically fetched from the REST API endpoints.
 */
export interface RestFollower {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name?: string | null;
}

/**
 * Represents batch user name data for resolving specific user details.
 */
export interface GraphQLBatchUserName {
  login: string;
  name: string | null;
}
