/**
 * Hosts where the public marketing site (Hub + Tenant) is served and the
 * admin/management surface MUST NEVER be reachable. Anything outside this
 * list (localhost, preview environments, future admin subdomains) keeps
 * the admin toggle and admin views available.
 *
 * Operators can extend this list at build time without a code change via
 * VITE_PUBLIC_MARKETING_HOSTS, a comma-separated list of hostnames.
 */
const DEFAULT_PUBLIC_HOSTS: readonly string[] = [
  'rent-ruby.com',
  'www.rent-ruby.com',
];

function parseEnvHosts(): string[] {
  const raw = (import.meta as any)?.env?.VITE_PUBLIC_MARKETING_HOSTS;
  if (typeof raw !== 'string' || !raw.trim()) return [];
  return raw
    .split(',')
    .map((host: string) => host.trim().toLowerCase())
    .filter(Boolean);
}

const PUBLIC_MARKETING_HOSTS: ReadonlySet<string> = new Set<string>([
  ...DEFAULT_PUBLIC_HOSTS,
  ...parseEnvHosts(),
]);

/**
 * Returns true when the current document is being served from a public
 * marketing hostname. Callers should hide management UI, refuse to render
 * the admin view, and prefer fail-closed behavior when this returns true.
 *
 * Safe to call during SSR — falls back to false when window is missing.
 */
export function isPublicMarketingSite(): boolean {
  if (typeof window === 'undefined') return false;
  return PUBLIC_MARKETING_HOSTS.has(window.location.hostname.toLowerCase());
}
