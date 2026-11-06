/**
 * Centralized API base URL configuration.
 * Defaults to http://localhost:8000 for local development.
 * Can be overridden in production (e.g. Vercel) by setting NEXT_PUBLIC_API_URL.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";
