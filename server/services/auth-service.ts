import { AuthRepository } from '../repositories/auth-repository';
import { User } from '../../shared/schema';

/**
 * خدمة المصادقة
 * تحتوي على المنطق التجاري للتحقق من المستخدمين وتسجيل الدخول
 */
export class AuthService {
  private repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }

  /**
   * التحقق من صحة بيانات تسجيل الدخول
   * @param username اسم المستخدم
   * @param password كلمة المرور
   */
  async validateLogin(username: string, password: string): Promise<{success: boolean; user?: User; message?: string}> {
    try {
      const user = await this.repository.getUserByUsername(username);
      
      if (!user) {
        return { 
          success: false, 
          message: 'اسم المستخدم غير صحيح'
        };
      }
      
      // ملاحظة: في الإنتاج، يجب استخدام مكتبة مثل bcrypt للتحقق من كلمة المرور
      // هنا نستخدم المقارنة المباشرة لمطابقة النظام القديم حاليًا
      if (user.password !== password) {
        return {
          success: false,
          message: 'كلمة المرور غير صحيحة'
        };
      }
      
      return {
        success: true,
        user
      };
    } catch (error) {
      console.error('Error in AuthService.validateLogin:', error);
      throw error;
    }
  }

  /**
   * الحصول على معلومات المستخدم بواسطة المعرف
   * @param id معرف المستخدم
   */
  async getUserById(id: number): Promise<User | undefined> {
    try {
      return await this.repository.getUserById(id);
    } catch (error) {
      console.error('Error in AuthService.getUserById:', error);
      throw error;
    }
  }

  /**
   * إزالة البيانات الحساسة من كائن المستخدم
   * @param user كائن المستخدم
   */
  sanitizeUser(user: User): Omit<User, 'password'> {
    const sanitizedUser = { ...user };
    delete (sanitizedUser as any).password;
    return sanitizedUser;
  }
}