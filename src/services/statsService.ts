export class StatsAPI {
  static baseURL = '/api/admin/dashboard';

  // ดึงสถิติภาพรวม
  static async getOverview() {
    try {
      const response = await fetch(`${this.baseURL}/overview`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching overview stats:', error);
      throw error;
    }
  }

  // ดึงสถิติตาม Priority
  static async getPriorityStats() {
    try {
      const response = await fetch(`${this.baseURL}/priority`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching priority stats:', error);
      throw error;
    }
  }

  // ดึงข้อมูลกิจกรรมรายสัปดาห์
  static async getWeeklyActivity() {
    try {
      const response = await fetch(`${this.baseURL}/weekly-activity`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching weekly activity:', error);
      throw error;
    }
  }

  // ดึงรายการ Todos
  static async getTodos(page = 1, limit = 50) {
    try {
      const response = await fetch(`${this.baseURL}/todos?page=${page}&limit=${limit}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
  }

  // ดึงรายการผู้ใช้
  static async getUsers(page = 1, limit = 50) {
    try {
      const response = await fetch(`${this.baseURL}/users?page=${page}&limit=${limit}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
}