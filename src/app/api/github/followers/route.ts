import { NextRequest, NextResponse } from "next/server";
import { GetMoreFollowersQuery } from "@/graphql/queries";
import { GraphQLFollowerNode, RestFollower, GraphQLError, GraphQLBatchUserName } from "@/types/interfaces";
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
  const cursor = searchParams.get("cursor");

  if (!username || !cursor) {
    return NextResponse.json(
      { error: "Username and cursor are required" },
      { status: 400 },
    );
  }

  if (cursor.length > 256) {
    return NextResponse.json(
      { error: "Cursor exceeds maximum length" },
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
        query: GetMoreFollowersQuery,
        variables: { username, cursor },
      }),
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `GitHub API error: ${res.status}` },
        { status: res.status },
      );
    }

    const { data, errors } = await res.json();
    if (errors && errors.length > 0) {
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

    const entity = data?.user;
    if (!entity) {
      // Organization followers pagination not supported in GraphQL query.
      // Fallback to REST API using the cursor as the page number.
      const pageNum = parseInt(cursor, 10);
      const restPage = isNaN(pageNum) || pageNum < 1 ? 2 : pageNum;

      const restRes = await fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/followers?per_page=100&page=${restPage}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            Authorization: `bearer ${GITHUB_TOKEN}`,
            "User-Agent": "NextJS-GitHub-Dashboard-App",
          },
        },
      );

      if (!restRes.ok) {
        return NextResponse.json(
          { error: "Failed to fetch org followers" },
          { status: restRes.status },
        );
      }

      let restFollowersList = await restRes.json();
      if (!Array.isArray(restFollowersList)) {
        restFollowersList = [];
      }

      if (restFollowersList.length > 0) {
        const variableDecls = restFollowersList
          .map((_: RestFollower, i: number) => `$login${i}: String!`)
          .join(", ");
        const aliases = restFollowersList
          .map(
            (_: RestFollower, i: number) =>
              `u${i}: user(login: $login${i}) { login name }`,
          )
          .join("\n");
        const batchQuery = `query BatchNames(${variableDecls}) { ${aliases} }`;
        const variables = Object.fromEntries(
          restFollowersList.map((f: RestFollower, i: number) => [
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
              restFollowersList = restFollowersList.map((f: RestFollower) => ({
                ...f,
                name: loginToName[f.login] || null,
              }));
            }
          }
        } catch (e) {
          console.error(
            "Failed to batch fetch org follower names",
            e instanceof Error ? e.message : String(e),
          );
        }
      }

      const orgFollowers = restFollowersList.map((follower: RestFollower) => ({
        login: follower.login,
        id: follower.id,
        avatar_url: follower.avatar_url,
        html_url: follower.html_url,
        name: follower.name || null,
      }));

      const response = NextResponse.json({
        followers: orgFollowers,
        pageInfo: {
          hasNextPage: orgFollowers.length === 100,
          endCursor: orgFollowers.length === 100 ? String(restPage + 1) : null,
        },
      });
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }

    const followers = (entity.followers?.nodes || []).map(
      (follower: GraphQLFollowerNode) => ({
        login: follower.login,
        id: follower.databaseId,
        avatar_url: follower.avatarUrl,
        html_url: follower.url,
        name: follower.name || null,
      }),
    );

    const pageInfo = entity.followers?.pageInfo || {
      hasNextPage: false,
      endCursor: null,
    };

    const response = NextResponse.json({ followers, pageInfo });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    console.error(
      "GitHub followers proxy error:",
      error instanceof Error ? error.message : String(error),
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
