export const applyInterceptors = (fetchInstance) => {
  return async (url, options = {}) => {
    // Request interceptor: add auth token if available
    const token = window.localStorage.getItem('groupsync_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      const response = await fetchInstance(url, { ...options, headers });
      
      // Response interceptor: handle 401 unauthorized
      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
      return response;
    } catch (error) {
      console.error('[HTTP Error]', error);
      throw error;
    }
  };
};

export default applyInterceptors;
