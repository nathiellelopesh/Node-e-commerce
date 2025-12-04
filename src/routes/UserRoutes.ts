import { Router } from 'express';
import { AuthController } from '../controllers/UserController.js';

const router = Router();

router.post('/register', AuthController.handleRegistration);

router.post('/login', AuthController.handleLogin);

router.post('/logout', AuthController.handleLogout);

router.delete('/deactivate', AuthController.handleAccountDeactivation);

export default router;