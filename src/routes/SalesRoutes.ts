// /routes/salesRouter.js

import express from 'express';
import { SalesController } from '../controllers/SaleController.js';
import { protect } from '../middlewares/AuthMiddleware.js';

const router = express.Router();

router.post('/', protect, SalesController.createSale);

router.get('/', protect, SalesController.getSalesByUserId);

export default router;