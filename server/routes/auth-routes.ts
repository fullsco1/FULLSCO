import { Router } from 'express';
import { AuthController } from '../controllers/auth-controller';
import { isAuthenticated } from '../middlewares/auth-middleware';

const router = Router();
const controller = new AuthController();

// تسجيل الدخول
router.post('/login', (req, res) => controller.login(req, res));

// تسجيل الخروج
router.post('/logout', (req, res) => controller.logout(req, res));

// الحصول على معلومات المستخدم الحالي
router.get('/me', isAuthenticated, (req, res) => controller.getCurrentUser(req, res));

export default router;