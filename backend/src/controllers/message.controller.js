import { messageService } from '../services/message.service.js';

export const getMessages = async (req, res, next) => {
  try {
    const messages = await messageService.getChannelMessages(req.params.channel);
    res.json({ data: messages });
  } catch (err) {
    next(err);
  }
};

export default { getMessages };
