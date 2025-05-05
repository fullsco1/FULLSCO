import bcrypt from 'bcrypt';
import { AuthRepository } from '../repositories/auth-repository';
import { User } from '../../shared/schema';

interface ValidateLoginResult {
  success: boolean;
  message: string;
  user?: User;
}

export class AuthService {
  private repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }

  /**
   * التحقق من بيانات تسجيل الدخول
   * @param username اسم المستخدم
   * @param password كلمة المرور
   * @returns نتيجة التحقق
   */
  async validateLogin(username: string, password: string): Promise<ValidateLoginResult> {
    try {
      // البحث عن المستخدم بواسطة اسم المستخدم
      const user = await this.repository.getUserByUsername(username);
      
      if (!user) {
        return {
          success: false,
          message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
        };
      }

      // التحقق من كلمة المرور
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        return {
          success: false,
          message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
        };
      }

      return {
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        user
      };
    } catch (error) {
      console.error('Error in AuthService.validateLogin:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء محاولة تسجيل الدخول'
      };
    }
  }

  /**
   * الحصول على معلومات المستخدم بواسطة معرفه
   * @param userId معرف المستخدم
   * @returns بيانات المستخدم
   */
  async getUserById(userId: number): Promise<User | null> {
    try {
      return await this.repository.getUserById(userId);
    } catch (error) {
      console.error('Error in AuthService.getUserById:', error);
      return null;
    }
  }

  /**
   * إزالة الحقول الحساسة من بيانات المستخدم
   * @param user بيانات المستخدم
   * @returns بيانات المستخدم بدون الحقول الحساسة
   */
  sanitizeUser(user: User): Omit<User, 'password'> {
    // نسخ المستخدم وحذف حقل كلمة المرور
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}