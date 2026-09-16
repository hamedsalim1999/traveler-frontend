declare global {
  interface Window {
    __APP_CONFIG__?: { API_URL?: string | null };
  }
}

/**
 * Resolves the API base URL: runtime config.js (Docker/EKS entrypoint or a
 * static-hosting deploy pipeline) takes priority over the build-time
 * VITE_API_URL, so one built image/bundle can be pointed at any backend
 * without a rebuild.
 */
export const API_URL: string =
  (typeof window !== 'undefined' && window.__APP_CONFIG__?.API_URL) ||
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:8080';
