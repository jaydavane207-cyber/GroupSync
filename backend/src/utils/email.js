import { logger } from './logger.js';

export const sendEmail = async ({ to, subject, html }) => {
  logger.info(`Sending email to ${to}: "${subject}"`);
  return { success: true };
};

export default { sendEmail };
