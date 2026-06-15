import { NextRequest, NextResponse } from "next/server";
import { GetUserExplorerDataQuery } from "@/graphql/queries";
import { GraphQLError, RestFollower, GraphQLRepoNode, GraphQLFollowerNode, GraphQLBatchUserName } from "@/types/interfaces";
import { isValidUsername } from "@/utils/usernameRegex";
import { checkRateLimit } from "@/utils/rateLimit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rateLimit = await checkRateLimit(ip);

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": rateLimit.limit.toString(),
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": new Date(rateLimit.reset).toISOString(),
        },
      },
    );
  }
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 },
    );
  }

  if (!isValidUsername(username)) {
    return NextResponse.json(
      { error: "Invalid username format" },
      { status: 400 },
    );
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  if (!GITHUB_TOKEN) {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${GITHUB_TOKEN}`,
        "User-Agent": "NextJS-GitHub-Dashboard-App",
      },
      body: JSON.stringify({
        query: GetUserExplorerDataQuery,
        variables: { username },
      }),
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errData.message || `GitHub API returned status ${res.status}`,
        },
        { status: res.status },
      );
    }

    const { data, errors } = await res.json();

    if (errors && errors.length > 0) {
      // Ignore NOT_FOUND errors unless BOTH user and organization are null
      const nonNotFoundError = errors.find(
        (e: GraphQLError) => e.type !== "NOT_FOUND",
      );
      if (nonNotFoundError) {
        const isRateLimit = nonNotFoundError.type === "RATE_LIMITED";
        return NextResponse.json(
          { error: "An error occurred while fetching data from GitHub." },
          { status: isRateLimit ? 429 : 400 },
        );
      }
    }

    const entity = data?.user || data?.organization;

    if (!entity) {
      return NextResponse.json(
        { error: "User or Organization not found" },
        { status: 404 },
      );
    }

    const isOrg = !!data.organization;

    let orgFollowersCount = 0;
    let orgFollowingCount = 0;
    let orgFollowersList: RestFollower[] = [];

    // GraphQL does not support fetching followers/following for Organizations (I'm pretty sure?).
    // We will request the data from the REST API.
    if (isOrg) {
      try {
        const [restProfileRes, restFollowersRes] = await Promise.all([
          fetch(
            `https://api.github.com/users/${encodeURIComponent(username)}`,
            {
              headers: {
                Accept: "application/vnd.github.v3+json",
                Authorization: `bearer ${GITHUB_TOKEN}`,
                "User-Agent": "NextJS-GitHub-Dashboard-App",
              },
            },
          ),
          fetch(
            `https://api.github.com/users/${encodeURIComponent(username)}/followers?per_page=100`,
            {
              headers: {
                Accept: "application/vnd.github.v3+json",
                Authorization: `bearer ${GITHUB_TOKEN}`,
                "User-Agent": "NextJS-GitHub-Dashboard-App",
              },
            },
          ),
        ]);

        if (restProfileRes.ok) {
          const restData = await restProfileRes.json();
          orgFollowersCount = restData.followers || 0;
          orgFollowingCount = restData.following || 0;
        } else {
          console.error(
            "REST profile fetch failed with status:",
            restProfileRes.status,
          );
        }

        if (restFollowersRes.ok) {
          orgFollowersList = await restFollowersRes.json();
          if (!Array.isArray(orgFollowersList)) {
            orgFollowersList = [];
          }
          if (orgFollowersList.length > 0) {
            const variableDecls = orgFollowersList
              .map((_: RestFollower, i: number) => `$login${i}: String!`)
              .join(", ");
            const aliases = orgFollowersList
              .map(
                (_: RestFollower, i: number) =>
                  `u${i}: user(login: $login${i}) { login name }`,
              )
              .join("\n");
            const batchQuery = `query BatchNames(${variableDecls}) { ${aliases} }`;
            const variables = Object.fromEntries(
              orgFollowersList.map((f: RestFollower, i: number) => [
                `login${i}`,
                f.login,
              ]),
            );
            try {
              const namesRes = await fetch("https://api.github.com/graphql", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `bearer ${GITHUB_TOKEN}`,
                  "User-Agent": "NextJS-GitHub-Dashboard-App",
                },
                body: JSON.stringify({ query: batchQuery, variables }),
              });
              if (namesRes.ok) {
                const namesData = await namesRes.json();
                if (namesData.data) {
                  const loginToName: Record<string, string | null> = {};
                  Object.values(namesData.data).forEach((u: unknown) => {
                    const user = u as GraphQLBatchUserName;
                    if (user && user.login) {
                      loginToName[user.login] = user.name;
                    }
                  });
                  orgFollowersList = orgFollowersList.map(
                    (f: RestFollower) => ({
                      ...f,
                      name: loginToName[f.login] || null,
                    }),
                  );
                }
              }
            } catch (e) {
              console.error(
                "Failed to batch fetch org follower names",
                e instanceof Error ? e.message : String(e),
              );
            }
          }
        } else {
          console.error(
            "REST followers fetch failed with status:",
            restFollowersRes.status,
          );
        }
      } catch (e) {
        console.error(
          "Failed to fetch org followers fallback",
          e instanceof Error ? e.message : String(e),
        );
      }
    }

    // Transform GraphQL response back to our existing frontend structures
    const profile = {
      login: entity.login,
      id: entity.databaseId,
      avatar_url: entity.avatarUrl,
      html_url: entity.url,
      name: entity.name,
      company: isOrg ? null : entity.company,
      blog: entity.websiteUrl,
      location: entity.location,
      bio: isOrg ? entity.description : entity.bio,
      twitter_username: entity.twitterUsername,
      public_repos: entity.repositories?.totalCount ?? 0,
      followers: isOrg
        ? orgFollowersCount
        : (entity.followers?.totalCount ?? 0),
      following: isOrg
        ? orgFollowingCount
        : (entity.following?.totalCount ?? 0),
      created_at: entity.createdAt,
      type: isOrg ? "Organization" : "User",
    };

    const repos = (entity.repositories?.nodes || []).map(
      (repo: GraphQLRepoNode) => ({
        id: repo.databaseId,
        name: repo.name,
        html_url: repo.url,
        description: repo.description,
        stargazers_count: repo.stargazerCount,
        language: repo.primaryLanguage?.name || null,
        pushed_at: repo.pushedAt,
        license: repo.licenseInfo ? { name: repo.licenseInfo.name } : null,
      }),
    );

    const followers = isOrg
      ? orgFollowersList.map((follower: RestFollower) => ({
          login: follower.login,
          id: follower.id,
          avatar_url: follower.avatar_url,
          html_url: follower.html_url,
          name: follower.name || null,
        }))
      : (entity.followers?.nodes || []).map(
          (follower: GraphQLFollowerNode) => ({
            login: follower.login,
            id: follower.databaseId,
            avatar_url: follower.avatarUrl,
            html_url: follower.url,
            name: follower.name || null,
          }),
        );

    const repoPageInfo = entity.repositories?.pageInfo || {
      hasNextPage: false,
      endCursor: null,
    };

    // For Orgs, we use REST for followers.
    // If we fetched 100 items, there is likely a next page.
    const followerPageInfo = isOrg
      ? {
          hasNextPage: orgFollowersList.length === 100,
          endCursor: orgFollowersList.length === 100 ? "2" : null,
        }
      : entity.followers?.pageInfo || { hasNextPage: false, endCursor: null };

    const response = NextResponse.json({
      profile,
      repos,
      followers,
      repoPageInfo,
      followerPageInfo,
    });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error: unknown) {
    console.error(
      "GitHub proxy error:",
      error instanceof Error ? error.message : String(error),
    );
    return NextResponse.json(
      { error: "Internal server error while fetching GitHub data" },
      { status: 500 },
    );
  }
}
