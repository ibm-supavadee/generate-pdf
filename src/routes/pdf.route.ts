import { Router } from 'express';
import { createPdf } from '../controllers/pdf.controller';

const router = Router();

router.post('/generate-playbox-pdf', createPdf);

export default router;