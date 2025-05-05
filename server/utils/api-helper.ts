import { Response } from 'express';
import { z } from 'zod';

/**
 * معالجة الاستثناءات وإعادة استجابة خطأ مناسبة
 * @param res كائن الاستجابة
 * @param error الخطأ الذي حدث
 * @returns استجابة مع رسالة خطأ
 */
export function handleException(res: Response, error: any): Response {
  console.error('API Error:', error);

  // معالجة أخطاء Zod (التحقق من صحة البيانات)
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      success: false,
      message: 'بيانات غير صالحة',
      errors: error.errors
    });
  }

  // معالجة أخطاء غير معروفة
  return res.status(500).json({
    success: false,
    message: 'حدث خطأ داخلي في الخادم',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}

/**
 * إنشاء استجابة نجاح
 * @param data البيانات المراد إرجاعها
 * @param message رسالة النجاح (اختيارية)
 * @returns كائن استجابة نجاح
 */
export function successResponse(data: any, message?: string) {
  return {
    success: true,
    message,
    data
  };
}