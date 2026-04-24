export const BRAND_GRAD = "linear-gradient(135deg, #1d4ed8 0%, #6b21a8 100%)";
export const BRAND_GRAD_R = "linear-gradient(to right, #1d4ed8, #6b21a8)";

export const fmtNum = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

export const RECENT_KEY = "tripvault_recent_searches";
export const MAX_RECENT = 5;

export const loadRecent = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
};

export const saveRecent = (list: string[]) =>
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));

export const addRecent = (q: string): string[] => {
  const prev = loadRecent().filter((s) => s !== q);
  const next = [q, ...prev].slice(0, MAX_RECENT);
  saveRecent(next);
  return next;
};
