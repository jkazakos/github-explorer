import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.KV_REST_API_URL || "";
const redisToken = process.env.KV_REST_API_TOKEN || "";

const ratelimit = new Ratelimit({
  redis: new Redis({ url: redisUrl, token: redisToken }),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
});

/**
 * Checks the rate limit for a given IP address.
 *
 * @param ip - The IP address to check the rate limit for.
 * @returns An object indicating whether the request is successful, the rate limit details, and the reset time.
 */
export async function checkRateLimit(ip: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  try {
    // If running locally without variables, allow the request
    if (!redisUrl || !redisToken) {
      console.warn("Missing KV credentials. Bypassing rate limit.");
      return { success: true, limit: 10, remaining: 10, reset: Date.now() };
    }

    const { success, limit, remaining, reset } = await ratelimit.limit(ip);
    return { success, limit, remaining, reset };
  } catch {
    console.error("Vercel KV rate limit failed, allowing request:");
    // If the database goes down, don't break the application
    return { success: true, limit: 10, remaining: 10, reset: Date.now() };
  }
}
