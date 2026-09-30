export const validateUser = (data) => {
  if (data.full_name && data.full_name.trim().length === 0) return 'Name cannot be empty.';
  return null;
};

export default validateUser;
