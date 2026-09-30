export const validateProject = (data) => {
  if (!data.title || data.title.trim().length === 0) return 'Project title is required.';
  return null;
};

export default validateProject;
