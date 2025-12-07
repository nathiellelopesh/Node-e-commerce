import { Router } from 'express';
import { CartController } from '../controllers/CartController.js';
import { protect } from '../middlewares/AuthMiddleware.js';

const router = Router();

router.post('/', protect, CartController.addItem);

router.get('/', protect, CartController.getCart);

router.delete('/', protect, CartController.clearCart); 

router.delete('/:id', protect, CartController.removeItem);

router.put('/:id', protect, CartController.updateItemQuantity);

export default router;