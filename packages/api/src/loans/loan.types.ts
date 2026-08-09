export type LoanType = 'LEND' | 'BORROW';
export type LoanStatus = 'PENDING' | 'PARTIALLY_PAID' | 'SETTLED';

export interface LoanPayment {
  id: string;
  loanId: string;
  amount: number;
  paymentMethod: string;
  date: string;
  notes?: string | null;
  createdAt: string;
}

export interface Loan {
  id: string;
  userId: string;
  counterpartyId?: string | null;
  type: LoanType;
  rawType: LoanType;
  isOwner: boolean;
  personName: string;
  personEmail?: string | null;
  personImage?: string | null;
  isRegisteredUser: boolean;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: LoanStatus;
  paymentMethod: string;
  date: string;
  dueDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  payments?: LoanPayment[];
}

export interface LoanSummary {
  totalLent: number;
  totalBorrowed: number;
  totalLentPending: number;
  totalBorrowedPending: number;
  totalSettled: number;
  netBalance: number;
}

export interface CreateLoanInput {
  type: LoanType;
  personName: string;
  personEmail?: string | null;
  counterpartyId?: string | null;
  amount: number;
  paymentMethod?: string;
  date: string;
  dueDate?: string | null;
  notes?: string | null;
}

export interface UpdateLoanInput {
  id: string;
  personName?: string;
  personEmail?: string | null;
  counterpartyId?: string | null;
  amount?: number;
  paymentMethod?: string;
  date?: string;
  dueDate?: string | null;
  notes?: string | null;
}

export interface AddLoanPaymentInput {
  loanId: string;
  amount: number;
  paymentMethod?: string;
  date: string;
  notes?: string | null;
}

export interface GetLoansQueryParams {
  type?: 'LEND' | 'BORROW' | 'ALL';
  status?: 'PENDING' | 'PARTIALLY_PAID' | 'SETTLED' | 'ALL';
  search?: string;
  limit?: number;
}
