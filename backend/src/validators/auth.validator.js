export const validateAuth = (data) => {
  if (!data.email || !data.email.includes('@')) return 'A valid email is required.';
  if (!data.password || data.password.length < 6) return 'Password must be at least 6 characters.';
  return null;
};

export default validateAuth;
