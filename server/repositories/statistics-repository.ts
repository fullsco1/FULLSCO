import { db } from '../../db';
import { statistics } from '../../shared/schema';
import { InsertStatistic, Statistic } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export class StatisticsRepository {
  /**
   * الحصول على إحصائية بواسطة المعرف
   * @param id معرف الإحصائية
   * @returns بيانات الإحصائية أو null إذا لم تكن موجودة
   */
  async getStatisticById(id: number): Promise<Statistic | null> {
    try {
      const result = await db.select().from(statistics).where(eq(statistics.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error in StatisticsRepository.getStatisticById:', error);
      throw error;
    }
  }

  /**
   * إنشاء إحصائية جديدة
   * @param data بيانات الإحصائية
   * @returns الإحصائية التي تم إنشاؤها
   */
  async createStatistic(data: InsertStatistic): Promise<Statistic> {
    try {
      const result = await db.insert(statistics).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error in StatisticsRepository.createStatistic:', error);
      throw error;
    }
  }

  /**
   * تحديث إحصائية موجودة
   * @param id معرف الإحصائية
   * @param data البيانات المراد تحديثها
   * @returns الإحصائية المحدثة أو null إذا لم يتم العثور عليها
   */
  async updateStatistic(id: number, data: Partial<InsertStatistic>): Promise<Statistic | null> {
    try {
      const result = await db
        .update(statistics)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(statistics.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error('Error in StatisticsRepository.updateStatistic:', error);
      throw error;
    }
  }

  /**
   * حذف إحصائية
   * @param id معرف الإحصائية
   * @returns هل تمت عملية الحذف بنجاح
   */
  async deleteStatistic(id: number): Promise<boolean> {
    try {
      const result = await db.delete(statistics).where(eq(statistics.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error in StatisticsRepository.deleteStatistic:', error);
      throw error;
    }
  }

  /**
   * الحصول على قائمة الإحصاءات
   * @param filters فلاتر البحث (اختياري)
   * @returns قائمة الإحصاءات
   */
  async listStatistics(filters?: { isActive?: boolean }): Promise<Statistic[]> {
    try {
      let query = db.select().from(statistics);
      
      if (filters?.isActive !== undefined) {
        query = query.where(eq(statistics.isActive, filters.isActive));
      }
      
      return await query;
    } catch (error) {
      console.error('Error in StatisticsRepository.listStatistics:', error);
      throw error;
    }
  }
}