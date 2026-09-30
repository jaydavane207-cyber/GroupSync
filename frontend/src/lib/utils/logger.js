const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args) => {
    if (isDev) console.log('[LOG]', ...args);
  },
  info: (...args) => {
    if (isDev) console.info('[INFO]', ...args);
  },
  warn: (...args) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args) => {
    console.error('[ERROR]', ...args);
  },
};

export default logger;
