/** Formats a byte count as "12.3 KB", "1.4 MB", etc. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

/** True if a MIME type should be rendered as an inline image preview. */
export function isImageType(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}
