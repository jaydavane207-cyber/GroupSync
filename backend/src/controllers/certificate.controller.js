import { certificateService } from '../services/certificate.service.js';

export const verifyCertificate = async (req, res, next) => {
  try {
    const result = await certificateService.verify(req.params.id);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};

export default { verifyCertificate };
