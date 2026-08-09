const VISITOR_STORAGE_KEY = "kid-portfolio-visitor-id-v1";
const SAFE_BRANCH_PATTERN = /^\/[a-z0-9/_-]*$/;

export function isValidBranchId(value: string) {
  return SAFE_BRANCH_PATTERN.test(value) && !value.includes("//");
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface CryptoLike {
  randomUUID(): string;
}

function safePath(pathname: string | undefined) {
  if (!pathname) return null;
  try {
    const decoded = decodeURIComponent(pathname).trim().toLowerCase();
    const normalized = decoded === "/" ? "/" : decoded.replace(/\/+$/, "");
    return isValidBranchId(normalized) ? normalized : null;
  } catch {
    return null;
  }
}

export function normalizeBranchId(pathname: string, storedBranch?: string) {
  const current = safePath(pathname);
  const stored = safePath(storedBranch);
  if (!current) return stored ?? "/";
  if (current === "/about" || current.startsWith("/work/")) {
    return stored ?? "/";
  }
  return current;
}

export function getOrCreateVisitorId(
  storage: StorageLike,
  crypto: CryptoLike = globalThis.crypto,
) {
  const stored = storage.getItem(VISITOR_STORAGE_KEY);
  if (stored) return stored;
  const id = crypto.randomUUID();
  storage.setItem(VISITOR_STORAGE_KEY, id);
  return id;
}

export function createSessionId(crypto: CryptoLike = globalThis.crypto) {
  return crypto.randomUUID();
}
