import { Router } from 'express';
import { ReportController } from '../controllers/ReportController.js';
import { protect } from '../middlewares/AuthMiddleware.js';

const router = Router();

router.get('/', protect, ReportController.getSalesMetrics); 

export default router;