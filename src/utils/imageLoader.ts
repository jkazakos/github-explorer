// Use custom loader for follower images to prevent from surpassing Vercel free tier limits
export const githubAvatarLoader = ({ src, width }: { src: string; width: number }) => {
  try {
    const url = new URL(src);
    url.searchParams.set("s", width.toString());
    return url.toString();
  } catch {
    return src;
  }
};
