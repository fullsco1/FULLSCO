import { Response } from 'express';
import { ZodError } from 'zod';

/**
 * معالجة الاستثناءات وإرجاع الرد المناسب
 * @param res كائن الاستجابة
 * @param error كائن الخطأ
 */
export function handleException(res: Response, error: unknown): Response {
  console.error('API Error:', error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'بيانات غير صالحة',
      errors: error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }))
    });
  }

  if (error instanceof Error) {
    // خطأ معروف مع رسالة
    return res.status(500).json({
      message: 'حدث خطأ أثناء معالجة الطلب',
      error: error.message
    });
  }

  // خطأ غير معروف
  return res.status(500).json({
    message: 'حدث خطأ غير متوقع في الخادم'
  });
}

/**
 * تهيئة رسالة نجاح مع بيانات
 * @param data البيانات المراد إرجاعها
 * @param message رسالة النجاح
 */
export function successResponse<T>(data: T, message: string = 'تمت العملية بنجاح') {
  return {
    success: true,
    message,
    data
  };
}

/**
 * تهيئة رسالة خطأ
 * @param message رسالة الخطأ
 * @param statusCode رمز الحالة
 * @param errors أخطاء التحقق من الصحة (اختياري)
 */
export function errorResponse(message: string, statusCode: number = 400, errors?: any[]) {
  const response: any = {
    success: false,
    message,
    statusCode
  };

  if (errors) {
    response.errors = errors;
  }

  return response;
}