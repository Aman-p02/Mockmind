import { Router } from 'express';
import { generateAptitudeQuestions, submitAptitudeScore } from '../controllers/aptitudeController';
import { generateDSAProblem, submitDSAResult } from '../controllers/dsaController';
import { generateFundamentalsQuestions, submitFundamentalsScore } from '../controllers/fundamentalsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Aptitude
router.get('/aptitude/generate', authMiddleware, generateAptitudeQuestions);
router.post('/aptitude/submit', authMiddleware, submitAptitudeScore);

// DSA
router.get('/dsa/generate', authMiddleware, generateDSAProblem);
router.post('/dsa/submit', authMiddleware, submitDSAResult);

// Fundamentals
router.get('/fundamentals/generate', authMiddleware, generateFundamentalsQuestions);
router.post('/fundamentals/submit', authMiddleware, submitFundamentalsScore);

export default router;
