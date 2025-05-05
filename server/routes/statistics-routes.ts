import { Router } from 'express';
import { StatisticsController } from '../controllers/statistics-controller.ts';
import { isAdmin } from '../middlewares/auth-middleware.ts';

const router = Router();
const controller = new StatisticsController();

// الحصول على قائمة الإحصاءات
router.get('/', (req, res) => controller.listStatistics(req, res));

// الحصول على إحصائية بواسطة المعرف
router.get('/:id', (req, res) => controller.getStatisticById(req, res));

// إنشاء إحصائية جديدة (يتطلب صلاحيات المسؤول)
router.post('/', isAdmin, (req, res) => controller.createStatistic(req, res));

// تحديث إحصائية (يتطلب صلاحيات المسؤول)
router.put('/:id', isAdmin, (req, res) => controller.updateStatistic(req, res));

// تحديث جزئي لإحصائية (يتطلب صلاحيات المسؤول)
router.patch('/:id', isAdmin, (req, res) => controller.updateStatistic(req, res));

// حذف إحصائية (يتطلب صلاحيات المسؤول)
router.delete('/:id', isAdmin, (req, res) => controller.deleteStatistic(req, res));

export default router;