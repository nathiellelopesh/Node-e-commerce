import { Router } from 'express';
import { FavoriteController } from '../controllers/favoriteController.js';
import { protect } from '../middlewares/AuthMiddleware.js';

const router = Router();

router.post('/', protect, FavoriteController.addFavorite); 

router.delete('/:id', protect, FavoriteController.removeFavorite);

router.get('/', protect, FavoriteController.getFavorites); 

export default router;