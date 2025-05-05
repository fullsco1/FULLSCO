import { db } from '../../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { User } from '../../shared/schema';

/**
 * مستودع المصادقة
 * يتعامل مع عمليات قاعدة البيانات المتعلقة بالمستخدمين والمصادقة
 */
export class AuthRepository {
  /**
   * الحصول على مستخدم حسب المعرف
   * @param id معرف المستخدم
   */
  async getUserById(id: number): Promise<User | undefined> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, id)
      });
      return user;
    } catch (error) {
      console.error('Error in AuthRepository.getUserById:', error);
      throw error;
    }
  }

  /**
   * الحصول على مستخدم حسب اسم المستخدم
   * @param username اسم المستخدم
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.username, username)
      });
      return user;
    } catch (error) {
      console.error('Error in AuthRepository.getUserByUsername:', error);
      throw error;
    }
  }

  /**
   * الحصول على مستخدم حسب البريد الإلكتروني
   * @param email البريد الإلكتروني
   */
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.email, email)
      });
      return user;
    } catch (error) {
      console.error('Error in AuthRepository.getUserByEmail:', error);
      throw error;
    }
  }
}