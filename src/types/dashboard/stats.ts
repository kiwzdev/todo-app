// สถิติรวม
export type OverviewStats = {
  totalUsers: number;
  totalTodos: number;
  completedTodos: number;
  pendingTodos: number;
  userGrowth: number; // % growth
  completionRate: number; // % rate
};

// ข้อมูล priority (สำหรับ pie chart หรือสถิติ)
export type PriorityItem = {
  name: "High" | "Medium" | "Low";
  value: number;
  color: string;
};

// กิจกรรมแต่ละวันของสัปดาห์
export type WeeklyActivityItem = {
  day: string; // เช่น "Mon", "Tue"
  completed: number;
  created: number;
};

// ข้อมูลของ todo รายการเดียว
export type TodoItem = {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string; // ISO Date
  tags: string[];
  priority: "high" | "medium" | "low";
  user: string; // email หรือ user ID
  createdAt: string; // ISO Date
};

// ข้อมูลผู้ใช้
export type UserItem = {
  _id: string;
  email: string;
  username: string;
  isVerified: boolean;
  todosCount: number;
  completedTodos: number;
  lastActive: string; // ISO Date
  joinDate: string; // ISO Date
};

// รวมทั้งหมดในหน้าหลัก dashboard
export type DashboardStats = {
  overview: OverviewStats;
  priorityData: PriorityItem[];
  weeklyActivity: WeeklyActivityItem[];
  todos: TodoItem[];
  users: UserItem[];
};
