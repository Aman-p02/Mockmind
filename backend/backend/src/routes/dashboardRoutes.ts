import { Router } from 'express';
import { getDashboardStats, getDashboardHistory, clearHistory } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/stats', authMiddleware, getDashboardStats);
router.get('/history', authMiddleware, getDashboardHistory);
router.delete('/history', authMiddleware, clearHistory);

export default router;
