export const edgeConfig = {
  regions: [
    { id: "iad1", name: "US East (Virginia)", neonRegion: "aws-us-east-1" },
    { id: "sfo1", name: "US West (San Francisco)", neonRegion: "aws-us-west-2" },
    { id: "lhr1", name: "Europe (London)", neonRegion: "aws-eu-west-1" },
    { id: "hnd1", name: "Asia (Tokyo)", neonRegion: "aws-ap-northeast-1" },
    { id: "syd1", name: "Australia (Sydney)", neonRegion: "aws-ap-southeast-2" },
  ],
  defaultRegion: "iad1",
};

export type Region = (typeof edgeConfig.regions)[number];

const timezoneRegionMap: Record<string, string> = {
  "America/New_York": "iad1",
  "America/Chicago": "iad1",
  "America/Denver": "sfo1",
  "America/Los_Angeles": "sfo1",
  "America/Anchorage": "sfo1",
  "America/Phoenix": "sfo1",
  "Europe/London": "lhr1",
  "Europe/Paris": "lhr1",
  "Europe/Berlin": "lhr1",
  "Europe/Amsterdam": "lhr1",
  "Europe/Madrid": "lhr1",
  "Europe/Rome": "lhr1",
  "Europe/Zurich": "lhr1",
  "Europe/Stockholm": "lhr1",
  "Asia/Tokyo": "hnd1",
  "Asia/Seoul": "hnd1",
  "Asia/Shanghai": "hnd1",
  "Asia/Hong_Kong": "hnd1",
  "Asia/Singapore": "syd1",
  "Asia/Kolkata": "lhr1",
  "Australia/Sydney": "syd1",
  "Australia/Melbourne": "syd1",
  "Pacific/Auckland": "syd1",
};

/**
 * Map a timezone string to the nearest configured region.
 */
export function getNearestRegion(timezone?: string): string {
  if (!timezone) return edgeConfig.defaultRegion;

  if (timezoneRegionMap[timezone]) {
    return timezoneRegionMap[timezone];
  }

  // Fall back to region based on timezone prefix
  if (timezone.startsWith("America/")) return "iad1";
  if (timezone.startsWith("Europe/")) return "lhr1";
  if (timezone.startsWith("Asia/")) return "hnd1";
  if (timezone.startsWith("Australia/") || timezone.startsWith("Pacific/")) return "syd1";

  return edgeConfig.defaultRegion;
}
