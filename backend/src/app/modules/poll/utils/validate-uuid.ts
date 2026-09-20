const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A malformed id (wrong shape, injected garbage, etc) reaching a uuid
 * column throws a raw Postgres "invalid input syntax" error rather than a
 * validation error — this catches it before the query, so callers get a
 * clean 400 instead of a generic 500.
 */
export const isValidUUID = (value: string): boolean => UUID_RE.test(value);
