import { RepoFragment, FollowerFragment } from "./fragments";

export const GetUserExplorerDataQuery = `
  ${RepoFragment}
  ${FollowerFragment}

  query GetUserExplorerData($username: String!) {
    user(login: $username) {
      login
      databaseId
      avatarUrl
      url
      name
      company
      websiteUrl
      location
      bio
      twitterUsername
      createdAt
      repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: PUSHED_AT, direction: DESC}) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ...RepoFragment
        }
      }
      followers(first: 100) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ...FollowerFragment
        }
      }
      following {
        totalCount
      }
    }
    organization(login: $username) {
      login
      databaseId
      avatarUrl
      url
      name
      websiteUrl
      location
      description
      twitterUsername
      createdAt
      repositories(first: 100, orderBy: {field: PUSHED_AT, direction: DESC}) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ...RepoFragment
        }
      }
    }
  }
`;

export const GetMoreRepositoriesQuery = `
  ${RepoFragment}

  query GetMoreRepositories($username: String!, $cursor: String!) {
    user(login: $username) {
      repositories(first: 100, after: $cursor, ownerAffiliations: OWNER, orderBy: {field: PUSHED_AT, direction: DESC}) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ...RepoFragment
        }
      }
    }
    organization(login: $username) {
      repositories(first: 100, after: $cursor, orderBy: {field: PUSHED_AT, direction: DESC}) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ...RepoFragment
        }
      }
    }
  }
`;

export const GetMoreFollowersQuery = `
  ${FollowerFragment}

  query GetMoreFollowers($username: String!, $cursor: String!) {
    user(login: $username) {
      followers(first: 100, after: $cursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ...FollowerFragment
        }
      }
    }
  }
`;
