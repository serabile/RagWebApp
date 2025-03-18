export const getDefaultApiUrl = (): string => {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEFAULT_API_URL) {
    return process.env.NEXT_PUBLIC_DEFAULT_API_URL;
  }
  return 'http://localhost:8000'; // Fallback
};
