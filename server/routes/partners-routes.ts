import { Router } from 'express';
import { PartnersController } from '../controllers/partners-controller.ts';
import { isAdmin } from '../middlewares/auth-middleware.ts';

const router = Router();
const controller = new PartnersController();

// الحصول على قائمة الشركاء
router.get('/', controller.listPartners);

// الحصول على شريك بواسطة المعرف
router.get('/:id', controller.getPartnerById);

// إنشاء شريك جديد (يتطلب صلاحيات المسؤول)
router.post('/', isAdmin, controller.createPartner);

// تحديث شريك (يتطلب صلاحيات المسؤول)
router.put('/:id', isAdmin, controller.updatePartner);

// تحديث جزئي لشريك (يتطلب صلاحيات المسؤول)
router.patch('/:id', isAdmin, controller.updatePartner);

// حذف شريك (يتطلب صلاحيات المسؤول)
router.delete('/:id', isAdmin, controller.deletePartner);

export default router;