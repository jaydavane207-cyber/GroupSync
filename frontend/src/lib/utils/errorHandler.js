export const parseErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred.';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (error.error_description) return error.error_description;
  return 'An unknown error occurred.';
};

export const handleApiError = (error, fallbackMessage = 'Action failed') => {
  const message = parseErrorMessage(error);
  console.error(`[API Error] ${fallbackMessage}:`, error);
  return message;
};

export default { parseErrorMessage, handleApiError };
