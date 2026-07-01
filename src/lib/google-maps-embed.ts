/** Google Maps embed URL from a plain-text address (no API key). */
export function googleMapsEmbedUrl(address: string): string {
  const q = encodeURIComponent(address.trim());
  return `https://www.google.com/maps?q=${q}&output=embed`;
}
