import { StatisticsRepository } from '../repositories/statistics-repository.ts';
import { Statistic, InsertStatistic } from '../../shared/schema';

export class StatisticsService {
  private repository: StatisticsRepository;

  constructor() {
    this.repository = new StatisticsRepository();
  }

  /**
   * الحصول على إحصائية بواسطة المعرف
   * @param id معرف الإحصائية
   * @returns بيانات الإحصائية أو null إذا لم تكن موجودة
   */
  async getStatisticById(id: number): Promise<Statistic | null> {
    try {
      return await this.repository.getStatisticById(id);
    } catch (error) {
      console.error('Error in StatisticsService.getStatisticById:', error);
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
      return await this.repository.createStatistic(data);
    } catch (error) {
      console.error('Error in StatisticsService.createStatistic:', error);
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
      return await this.repository.updateStatistic(id, data);
    } catch (error) {
      console.error('Error in StatisticsService.updateStatistic:', error);
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
      return await this.repository.deleteStatistic(id);
    } catch (error) {
      console.error('Error in StatisticsService.deleteStatistic:', error);
      throw error;
    }
  }

  /**
   * الحصول على قائمة الإحصاءات
   * @param isActive فلتر النشاط (اختياري)
   * @returns قائمة الإحصاءات
   */
  async listStatistics(isActive?: boolean): Promise<Statistic[]> {
    try {
      const filters = isActive !== undefined ? { isActive } : undefined;
      return await this.repository.listStatistics(filters);
    } catch (error) {
      console.error('Error in StatisticsService.listStatistics:', error);
      throw error;
    }
  }
}