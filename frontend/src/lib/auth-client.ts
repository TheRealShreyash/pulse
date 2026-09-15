import { createAuthClient } from "better-auth/react";

// Better Auth's client requires a fully-qualified URL (it constructs
// absolute redirect URLs internally, unlike a plain fetch() call), so it
// can't be a bare relative path the way services/auth.ts and services/poll.ts
// use elsewhere. Deriving it from window.location.origin at runtime keeps it
// resolving through the same dev/prod proxy those use (localhost:5173 in
// dev, pulse.shreyxsh.me in prod) without hardcoding either.
export const authClient = createAuthClient({
  baseURL: `${window.location.origin}/api/better-auth`,
});
