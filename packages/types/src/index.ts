export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_LOWERCASE_REGEX = /[a-z]/;
export const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
export const PASSWORD_NUMBER_REGEX = /[0-9]/;
export const PASSWORD_SPECIAL_CHAR_REGEX = /[^a-zA-Z0-9]/;

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
