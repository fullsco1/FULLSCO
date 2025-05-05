import express from 'express';
import { AuthController } from '../controllers/auth-controller';

const router = express.Router();
const controller = new AuthController();

/**
 * تسجيل الدخول
 * POST /api/auth/login
 */
router.post('/login', (req, res, next) => controller.login(req, res, next));

/**
 * تسجيل الخروج
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => controller.logout(req, res));

/**
 * الحصول على معلومات المستخدم الحالي
 * GET /api/auth/me
 */
router.get('/me', (req, res) => controller.getCurrentUser(req, res));

export default router;