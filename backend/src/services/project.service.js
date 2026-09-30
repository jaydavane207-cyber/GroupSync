export const projectService = {
  async getAll() {
    return [];
  },
  async getById(id) {
    return { id, title: 'Sample Project' };
  },
  async create(data) {
    return { id: 'new-id', ...data };
  },
};

export default projectService;
