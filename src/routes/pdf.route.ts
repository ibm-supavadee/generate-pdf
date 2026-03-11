import { Router } from "express";
import {
  createEAppPdf,
  createERequestPdf,
} from "../controllers/pdf.controller";

const router = Router();

router.post("/generate-erequest-pdf", createERequestPdf);
router.post("/generate-eapp-pdf", createEAppPdf);

export default router;
