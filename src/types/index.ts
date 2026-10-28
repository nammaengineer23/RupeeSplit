export interface Member {
  id: string;
  name: string;
  upiId: string;
  avatarColor: string;
  initials: string;
  phone?: string;
  email?: string;
}

export type ExpenseCategory =
  | 'Stay/Hotel'
  | 'Food & Drinks'
  | 'Travel/Fuel'
  | 'Activities'
  | 'Groceries'
  | 'Misc';

export type SplitType = 'EQUAL' | 'UNEQUAL' | 'PERCENTAGE';

export interface PayerSplit {
  memberId: string;
  amount: number;
}

export interface SplitShare {
  memberId: string;
  amount: number;
  percentage?: number;
  shares?: number;
  included?: boolean;
}

export interface ReceiptItem {
  name: string;
  price: number;
}

export interface ReceiptDetails {
  merchantName?: string;
  items?: ReceiptItem[];
  gst?: number;
  subtotal?: number;
}

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number; // in INR
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  paidBy: {
    type: 'SINGLE' | 'MULTI' | 'KITTY';
    singlePayerId?: string;
    payers?: PayerSplit[];
  };
  splitType: SplitType;
  splits: {
    memberId: string;
    amount: number;
    percentage?: number;
  }[];
  notes?: string;
  receiptDetails?: ReceiptDetails;
  createdAt: number;
}

export interface KittyContribution {
  id: string;
  tripId: string;
  memberId: string;
  amount: number; // in INR
  date: string;
  note?: string;
  createdAt: number;
}

export interface SettlementRecord {
  id: string;
  tripId: string;
  fromMemberId: string; // debtor
  toMemberId: string;   // creditor
  amount: number;       // in INR
  date: string;
  note?: string;
  upiRef?: string;
  createdAt: number;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  currency: string;
  members: Member[];
  inviteCode: string;
  createdAt: number;
}

export interface SimplifiedDebt {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
}

export interface MemberBalance {
  memberId: string;
  totalPaid: number;
  totalOwed: number;
  kittyContributed: number;
  netBalance: number; // positive = receives, negative = owes
}
