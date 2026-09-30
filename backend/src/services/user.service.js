export const userService = {
  async getProfile(userId) {
    return { id: userId, full_name: 'Alex Rivera', xp: 500, credibility_score: 85 };
  },
  async updateProfile(userId, updates) {
    return { id: userId, ...updates };
  },
};

export default userService;
