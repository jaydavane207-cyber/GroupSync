export const authService = {
  async register(email, password, fullName) {
    return { id: 'mock-user-id', email, full_name: fullName };
  },

  async login(email, password) {
    return { token: 'mock-jwt-token', user: { id: 'mock-user-id', email } };
  },
};

export default authService;
