export interface User {
  id: string;
  username: string;
  password?: string; // 学生账户可能没有密码
  role: 'admin' | 'student';
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface PracticeRecord {
  id: string;
  userId: string;
  username: string;
  toolType: 'chinese' | 'english' | 'poem';
  action: string;
  timestamp: Date;
  details?: any;
}

export interface LoginForm {
  username: string;
  password?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (form: LoginForm) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}
