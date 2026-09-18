const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
// The backend serves uploaded files from its origin (e.g. http://localhost:5000),
// not under /api, so strip the /api suffix to get the file-serving origin.
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

/**
 * Cloudinary attachments already have a full URL. Locally-stored
 * attachments only have a path like "/uploads/xyz.png" relative to the
 * backend, so we prefix it with the backend's origin.
 */
export function resolveAttachmentUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_ORIGIN}${url}`;
}
