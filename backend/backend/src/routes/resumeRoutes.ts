import { Router } from 'express';
import multer from 'multer';
import { analyzeResume } from '../controllers/resumeController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/analyze', authMiddleware, upload.single('resume'), analyzeResume);

export default router;
