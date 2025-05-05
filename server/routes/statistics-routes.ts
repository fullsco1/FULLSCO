import { Router } from 'express';
import { StatisticsController } from '../controllers/statistics-controller.ts';
import { isAdmin } from '../middlewares/auth-middleware.ts';

const router = Router();
const controller = new StatisticsController();

// الحصول على قائمة الإحصاءات
router.get('/', controller.listStatistics);

// الحصول على إحصائية بواسطة المعرف
router.get('/:id', controller.getStatisticById);

// إنشاء إحصائية جديدة (يتطلب صلاحيات المسؤول)
router.post('/', isAdmin, controller.createStatistic);

// تحديث إحصائية (يتطلب صلاحيات المسؤول)
router.put('/:id', isAdmin, controller.updateStatistic);

// تحديث جزئي لإحصائية (يتطلب صلاحيات المسؤول)
router.patch('/:id', isAdmin, controller.updateStatistic);

// حذف إحصائية (يتطلب صلاحيات المسؤول)
router.delete('/:id', isAdmin, controller.deleteStatistic);

export default router;