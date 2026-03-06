import { Router } from 'express';
import { createERequestPdf } from '../controllers/pdf.controller';

const router = Router();

router.post('/generate-erequest-pdf', createERequestPdf);

export default router;