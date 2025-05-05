import { Response } from 'express';
import { ZodError } from 'zod';

/**
 * إنشاء استجابة نجاح موحدة
 * @param data البيانات للإرجاع
 * @param message رسالة النجاح (اختياري)
 * @returns كائن استجابة موحد
 */
export function successResponse(data: any, message?: string) {
  return {
    success: true,
    message: message || 'تمت العملية بنجاح',
    data
  };
}

/**
 * التعامل مع الأخطاء وإرسال استجابة خطأ موحدة
 * @param res كائن الاستجابة Express
 * @param error كائن الخطأ
 */
export function handleException(res: Response, error: any) {
  console.error('API Error:', error);
  let status = 500;
  let message = 'حدث خطأ في الخادم';
  let details = null;

  if (error instanceof ZodError) {
    // خطأ في التحقق من البيانات
    status = 400;
    message = 'بيانات غير صالحة';
    details = error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message
    }));
  } else if (error?.code === 'P2002') {
    // خطأ فريد في قاعدة البيانات
    status = 400;
    message = 'هذه البيانات موجودة بالفعل';
  } else if (error?.code === 'P2025') {
    // سجل غير موجود
    status = 404;
    message = 'السجل غير موجود';
  }

  res.status(status).json({
    success: false,
    message,
    details
  });
}