export const uploadService = {
  async handleFileUpload(file) {
    return { url: 'https://storage.groupsync.app/files/sample.png' };
  },
};

export default uploadService;
