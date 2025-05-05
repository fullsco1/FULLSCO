import { Router } from 'express';
import { UsersController } from '../controllers/users-controller';
import { isAdmin, isAuthenticated } from '../middlewares/auth-middleware';

const router = Router();
const controller = new UsersController();

// مسارات المستخدمين العامة

// تسجيل الدخول
router.post('/login', (req, res) => controller.login(req, res));

// تسجيل الخروج
router.post('/logout', (req, res) => controller.logout(req, res));

// الحصول على معلومات المستخدم الحالي
router.get('/me', isAuthenticated, (req, res) => controller.getCurrentUser(req, res));

// مسارات المسؤول

// الحصول على قائمة المستخدمين (يتطلب صلاحيات المسؤول)
router.get('/', isAdmin, (req, res) => controller.listUsers(req, res));

// الحصول على مستخدم بواسطة المعرف (يتطلب صلاحيات المسؤول)
router.get('/:id([0-9]+)', isAdmin, (req, res) => controller.getUserById(req, res));

// إنشاء مستخدم جديد (يتطلب صلاحيات المسؤول)
router.post('/', isAdmin, (req, res) => controller.createUser(req, res));

// تحديث مستخدم (يتطلب صلاحيات المسؤول)
router.put('/:id', isAdmin, (req, res) => controller.updateUser(req, res));

// تحديث جزئي لمستخدم (يتطلب صلاحيات المسؤول)
router.patch('/:id', isAdmin, (req, res) => controller.updateUser(req, res));

// حذف مستخدم (يتطلب صلاحيات المسؤول)
router.delete('/:id', isAdmin, (req, res) => controller.deleteUser(req, res));

export default router;