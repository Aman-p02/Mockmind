import { Router } from 'express';
import { getDashboardStats, getDashboardHistory } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/stats', authMiddleware, getDashboardStats);
router.get('/history', authMiddleware, getDashboardHistory);

export default router;
