export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const isValidPassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

export const isNotEmpty = (val) => {
  if (val === null || val === undefined) return false;
  return String(val).trim().length > 0;
};

export default { isValidEmail, isValidPassword, isNotEmpty };
