export const validateTeam = (data) => {
  if (!data.name || data.name.trim().length === 0) return 'Team name is required.';
  return null;
};

export default validateTeam;
