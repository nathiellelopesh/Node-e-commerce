import { Router } from 'express';
import { AuthController } from '../controllers/UserController.js';
import { protect } from '../middlewares/AuthMiddleware.js';

const router = Router();

router.post('/register', AuthController.handleRegistration); //ok

router.post('/login', AuthController.handleLogin); //ok

router.post('/logout', AuthController.handleLogout); //ok

router.delete('/deactivate', protect, AuthController.handleAccountDeactivation);

export default router;