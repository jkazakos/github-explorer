/**
 * Use custom loader for follower images to prevent from surpassing Vercel free tier limits.
 *
 * @param src - The image source URL.
 * @param width - The desired width of the image.
 * @returns The modified image URL or the original source if an error occurs.
 */
export const githubAvatarLoader = ({ src, width }: { src: string; width: number }) => {
  try {
    const url = new URL(src);
    url.searchParams.set("s", width.toString());
    return url.toString();
  } catch {
    return src;
  }
};
