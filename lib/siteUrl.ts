// The site's address for links in emails. In production it must come from AUTH_URL: the request's
// own Host header can be forged on some hosts, which would let an attacker point reset links at their site.
export function siteUrl(requestOrigin: string): string {
    const configured = process.env.AUTH_URL?.replace(/\/+$/, "");
    if (configured) return configured;
    if (process.env.NODE_ENV === "production") {
        throw new Error("AUTH_URL must be set in production (e.g. https://your-domain.com) so email links point to the right site.");
    }
    return requestOrigin;
}
