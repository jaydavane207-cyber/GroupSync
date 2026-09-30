export const teamService = {
  async getAll() {
    return [];
  },
  async getById(id) {
    return { id, name: 'Sample Team' };
  },
};

export default teamService;
