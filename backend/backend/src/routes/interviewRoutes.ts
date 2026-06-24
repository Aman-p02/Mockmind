import { Router } from 'express';
import { startInterview, submitInterviewAnswer, getInterviewReport, getInterview } from '../controllers/interviewController';
import { startOffCampusInterview } from '../controllers/offCampusController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/start', authMiddleware, startInterview);
router.post('/start-offcampus', authMiddleware, startOffCampusInterview);
router.post('/submit', authMiddleware, submitInterviewAnswer);
router.get('/report/:interviewId', authMiddleware, getInterviewReport);
router.get('/result/:interviewId', authMiddleware, getInterviewReport);
router.get('/:interviewId', authMiddleware, getInterview);

export default router;
