const STORAGE_KEY = 'Resentravel.token';

let current: string | null = null;
try {
  current = localStorage.getItem(STORAGE_KEY);
} catch {
  // Private browsing / storage disabled — sessions just won't persist.
}

const listeners = new Set<(token: string | null) => void>();

export function getToken(): string | null {
  return current;
}

export function setToken(token: string | null) {
  current = token;
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures — the in-memory token still works this tab.
  }
  listeners.forEach((fn) => fn(token));
}

export function onTokenChange(fn: (token: string | null) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
