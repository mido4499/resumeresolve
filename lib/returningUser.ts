// Marks this browser as one someone has signed in on, so the landing page stops
// opening the onboarding intro by itself. Per browser: a new device or cleared cookies
// shows the intro again.
export const RETURNING_USER_COOKIE = "returning_user";

const ONE_YEAR_S = 60 * 60 * 24 * 365;

// Browser only; the landing page reads the cookie on the server
export function rememberThisDevice() {
    document.cookie = `${RETURNING_USER_COOKIE}=1; max-age=${ONE_YEAR_S}; path=/; samesite=lax`;
}
