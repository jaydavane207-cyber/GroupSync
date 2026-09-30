import { Router } from 'express';
import { verifyCertificate } from '../controllers/certificate.controller.js';

const router = Router();

router.post('/:id/verify', verifyCertificate);

export default router;
