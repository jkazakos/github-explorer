/**
 * Formats a date string into a human-readable format.
 *
 * @param dateString - The date string to format.
 * @returns The formatted date string or "Unknown Date" if the input is invalid.
 */
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
