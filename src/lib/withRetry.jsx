/**
 * withRetry — Supabase call wrapper with exponential backoff & error normalization
 *
 * Usage:
 *   const { data, error } = await withRetry(() =>
 *     supabase.from('projects').select('*')
 *   );
 *
 * Options:
 *   maxAttempts  — how many times to try before giving up (default 3)
 *   baseDelay    — first retry delay in ms (doubles each attempt, default 400)
 *   onRetry      — callback called before each retry with (attempt, error)
 */
export async function withRetry(fn, options = {}) {
  const { maxAttempts = 3, baseDelay = 400, onRetry } = options;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn();

      // Supabase always returns { data, error } — surface DB errors
      if (result?.error) {
        lastError = result.error;

        // Don't retry on client-side errors (bad request, auth, etc.)
        const code = result.error?.code || '';
        const status = result.error?.status || result.error?.statusCode || 0;
        if (isNonRetryableError(code, status)) {
          return { data: null, error: normalizeError(result.error) };
        }

        if (attempt < maxAttempts) {
          const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 100;
          onRetry?.(attempt, lastError);
          await sleep(delay);
          continue;
        }

        return { data: null, error: normalizeError(lastError) };
      }

      return result;
    } catch (err) {
      lastError = err;

      if (attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 100;
        onRetry?.(attempt, lastError);
        await sleep(delay);
      }
    }
  }

  return { data: null, error: normalizeError(lastError) };
}

/**
 * normalizeError — convert Supabase/network errors to user-friendly messages
 */
export function normalizeError(error) {
  if (!error) return null;

  const msg = error?.message || error?.error_description || String(error);
  const code = error?.code || '';
  const status = error?.status || error?.statusCode || 0;

  // Network / offline
  if (
    msg.includes('Failed to fetch') ||
    msg.includes('NetworkError') ||
    msg.includes('net::ERR') ||
    !navigator.onLine
  ) {
    return {
      ...error,
      userMessage: "You appear to be offline. Check your connection and try again.",
      retryable: true,
    };
  }

  // Auth errors
  if (status === 401 || code === 'PGRST301') {
    return {
      ...error,
      userMessage: "Your session has expired. Please log in again.",
      retryable: false,
    };
  }

  // Permission denied
  if (status === 403 || code === '42501') {
    return {
      ...error,
      userMessage: "You don't have permission to perform this action.",
      retryable: false,
    };
  }

  // Duplicate / unique constraint
  if (code === '23505') {
    return {
      ...error,
      userMessage: "This action has already been performed.",
      retryable: false,
    };
  }

  // Row not found
  if (code === 'PGRST116' || msg.includes('0 rows')) {
    return {
      ...error,
      userMessage: "The requested item could not be found.",
      retryable: false,
    };
  }

  // Rate limited
  if (status === 429) {
    return {
      ...error,
      userMessage: "Too many requests. Please wait a moment and try again.",
      retryable: true,
    };
  }

  // Server error
  if (status >= 500) {
    return {
      ...error,
      userMessage: "The server is temporarily unavailable. Please try again shortly.",
      retryable: true,
    };
  }

  return {
    ...error,
    userMessage: msg || "Something went wrong. Please try again.",
    retryable: true,
  };
}

function isNonRetryableError(code, status) {
  const nonRetryableCodes = ['23505', '23503', '42501', 'PGRST116'];
  const nonRetryableStatuses = [400, 401, 403, 404, 409, 422];
  return nonRetryableCodes.includes(code) || nonRetryableStatuses.includes(status);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * ErrorCard — reusable error display component with retry button
 * Import and use in any page for consistent error UX.
 */
export function ErrorCard({ message, onRetry, className = '' }) {
  return (
    <div className={`text-center py-16 bg-gs-card border border-rose-500/30 rounded-3xl p-8 ${className}`}>
      <div className="text-4xl mb-4">⚠️</div>
      <p className="text-lg font-bold text-gs-text-main mb-2">Something went wrong</p>
      <p className="text-sm text-gs-text-muted mb-6 max-w-xs mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-gs-primary text-[#050810] font-bold rounded-xl hover:bg-cyan-400 transition-all text-sm"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

/**
 * SkeletonCard — loading placeholder matching project/friend card dimensions
 */
export function SkeletonCard({ count = 6, className = '' }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-gs-card border border-gs-border rounded-3xl p-6 animate-pulse ${className}`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gs-bg" />
            <div className="w-20 h-6 rounded-full bg-gs-bg" />
          </div>
          <div className="h-5 bg-gs-bg rounded-lg mb-2 w-3/4" />
          <div className="h-4 bg-gs-bg rounded-lg mb-4 w-1/2" />
          <div className="h-3 bg-gs-bg rounded mb-1 w-full" />
          <div className="h-3 bg-gs-bg rounded mb-1 w-5/6" />
          <div className="h-3 bg-gs-bg rounded mb-5 w-4/6" />
          <div className="flex gap-2 mb-5">
            {[1, 2, 3].map(j => (
              <div key={j} className="h-6 w-16 bg-gs-bg rounded-lg" />
            ))}
          </div>
          <div className="h-10 bg-gs-bg rounded-xl w-full" />
        </div>
      ))}
    </>
  );
}
