export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "Unknown Date";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Unknown Date";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
