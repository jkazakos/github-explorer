import { NextRequest, NextResponse } from "next/server";
import { GetMoreRepositoriesQuery } from "@/graphql/queries";
import { GraphQLRepoNode, GraphQLError } from "@/types/interfaces";
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
        query: GetMoreRepositoriesQuery,
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

    const entity = data?.user || data?.organization;
    if (!entity) {
      return NextResponse.json(
        { error: "User or Organization not found" },
        { status: 404 },
      );
    }

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

    const pageInfo = entity.repositories?.pageInfo || {
      hasNextPage: false,
      endCursor: null,
    };

    const response = NextResponse.json({ repos, pageInfo });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    console.error(
      "GitHub repos proxy error:",
      error instanceof Error ? error.message : String(error),
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
