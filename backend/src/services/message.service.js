export const messageService = {
  async getChannelMessages(channel) {
    return [];
  },
  async sendChannelMessage(channel, userId, text) {
    return { id: 1, channel, text };
  },
};

export default messageService;
