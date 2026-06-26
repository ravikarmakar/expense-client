export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
}
