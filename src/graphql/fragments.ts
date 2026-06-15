export const RepoFragment = `
  fragment RepoFragment on Repository {
    databaseId
    name
    url
    description
    stargazerCount
    primaryLanguage {
      name
    }
    pushedAt
    licenseInfo {
      name
    }
  }
`;

export const FollowerFragment = `
  fragment FollowerFragment on User {
    databaseId
    name
    login
    avatarUrl
    url
  }
`;
