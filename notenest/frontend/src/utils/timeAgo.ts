import { formatDistanceToNow } from "date-fns";

/** Renders a timestamp as "3 hours ago", "2 days ago", etc. */
export function timeAgo(isoDate: string): string {
  return formatDistanceToNow(new Date(isoDate), { addSuffix: true });
}
