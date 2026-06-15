# GitHub Explorer Dashboard

A single-page application (SPA) dashboard built using **Next.js (App Router)** and **TanStack Query** (React Query) that queries the GitHub API. It leverages server-side proxying to securely handle API tokens and cache requests.

## Features

1. **User Profile Section**
    - Fetches and displays real-time user metadata: name, username, avatar, location, company, bio, Twitter handle, and account creation date.
    - Summarizes key statistics such as public repository count, followers, and following.
    - Includes a direct link to the user's official GitHub page.

1. **Overview Tab**
    - Displays basic info about the account: repositories, followers, account category, whether account is part of an org.
    - Displays the 3 most popular repositories (most starred).

1. **Repositories Tab**
    - Displays public repositories in batches of 100. Users can browse extensive portfolios by fetching additional repositories on demand using a "Load More" action.
    - Features custom client-side search to instantly filter repositories by name or description, alongside sorting controls to order them by stars or recent updates.

1. **Followers Tab**
    - Displays the total followers count and renders a list of the user's followers with their avatars.
    - Interactive follower cards: clicking a card instantly searches for that follower, allowing users to explore follower networks.
    - Features sorting controls to order users by name or date followed.

1. **Rate-Limiting & API Error Handling**
    - Search bar with submit actions to prevent hitting the GitHub API on every keystroke.
    - Clean handling for non-existent users (HTTP 404) with a "User Not Found" state.
    - Graceful recovery from connection failures or rate limits with descriptive error cards and a "Retry Request" action.

## Architecture & Tech Stack

- **Framework**: [React](https://react.dev/) & [Next.js](https://nextjs.org/)

- **State Management & Caching**: [TanStack Query v5](https://tanstack.com/query/latest) (React Query)
    - Keeps loaded profiles in memory so switching back and forth is instantaneous.
    - Automatically fetches fresh data in the background.

- **API Integration**: **GitHub GraphQL API** (with REST fallback)
    - Leverages [GraphQL](https://graphql.org/) to prevent over-fetching and minimize network requests.
    - Falls back to REST for endpoints with limited GraphQL support (e.g., Organization followers).

- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
    - Tailored deep space dark mode theme.
    - Micro-animations, glowing borders on focus, scale transitions on hover, and smooth slide-in animations.

- **Icons**: [Lucide React](https://lucide.dev/)

## Implementation Details & Trade-offs

### Why **GraphQL**?

The main reason for choosing GraphQL over the standard REST API is to avoid over-fetching and to reduce the number of network requests. With the REST API, fetching a user's profile, their repositories, and their followers would require multiple separate HTTP requests. With GraphQL, all this nested data can be requested in a single query. This makes the initial load significantly faster, reduces the bandwidth used, and consumes fewer points from the GitHub API rate limit.

### Fallback to **REST API** for **Organizations**

The GitHub GraphQL endpoint does not fully support fetching followers or following lists for Organization accounts, and pagination for these fields is restricted compared to standard User accounts.

Because of this limitation, the application has a fallback mechanism: when the queried entity is identified as an Organization and we need to fetch their followers, the server switches to using the GitHub REST API. This ensures the dashboard offers full functionality for both Users and Organizations.

### General Trade-offs

1. **Added Complexity**: Mixing both GraphQL and REST APIs introduces additional complexity to the codebase. We have to maintain separate queries/requests for both protocols and implement transformation layers to map the different response structures (GraphQL nodes vs REST objects) into a single, unified format for the frontend.

1. **Server-Side Proxying (Security Requirement)**: The application proxies all GitHub API requests through Next.js Route Handlers (`/api/github/...`) instead of fetching directly from the client.
   - *Why it's a MUST*: GitHub's GraphQL endpoint **requires** token authentication. To prevent exposing the `GITHUB_TOKEN` to the public browser, server-side fetching is an absolute security necessity, rather than just an architectural choice.
   - *Other Pros*: It allows us to implement server-side caching and significantly raises the rate limit from 60 requests/hour (unauthenticated) to 5,000 requests/hour (authenticated).
   - *Cons*: This adds slight latency since the request has to travel from Client -> Next.js Server -> GitHub -> Next.js Server -> Client. It also means the Next.js server consumes more bandwidth and compute to handle these requests.

1. **In-Memory Caching**: TanStack Query is used to cache the complete API response (profile info, repositories, and followers) keyed by the searched username. This `stale-while-revalidate` mechanism makes re-visiting previously searched profiles instantaneous. The trade-off is higher memory usage in the browser over long sessions (as large arrays of repositories and followers are stored in memory), though TanStack Query mitigates this via automatic garbage collection of unused cache entries.

## Getting Started

### Prerequisites

- Node.js (v20.0.0 or higher)
- pnpm (v9.0.0 or higher)

### Installation

1. Clone or navigate into the directory:

1. Install dependencies:

    ```bash
    pnpm install
    ```

1. Generate a Personal Access Token on GitHub (look at `.env.local.example` for instructions): [GitHub Token Settings](https://github.com/settings/tokens).

    ```env
    GITHUB_TOKEN=your_github_token
    ```

1. (Optional) Configure Upstash Redis for API rate limiting. If these are left blank, the application will bypass rate limiting and allow all requests.

    ```env
    KV_REST_API_URL=your_upstash_redis_rest_url_here
    KV_REST_API_TOKEN=your_upstash_redis_rest_token_here
    ```

### Running Locally

To start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the dashboard.

### Building for Production

To compile and optimize the production bundle:

```bash
pnpm build
```

To run the production build locally:

```bash
pnpm start
```

## Project Execution & Time Spent

The overall time dedicated to this assignment was **~20 hours**, distributed across a few days. The execution time can be roughly broken down into:

- **Architecture & Setup:** Next.js server-side proxying, and TanStack Query configuration.
- **API Integration:** Combining GraphQL with REST fallbacks, handling edge cases, rate limits, and caching.
- **UI/UX & Styling:** Responsive layouts using Tailwind.

## Deployment

The project is deployed on [Vercel](https://vercel.com)
