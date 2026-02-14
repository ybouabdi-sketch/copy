
export interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  password?: string;
  status: 'pending' | 'approved';
  requestDate: string;
  lastLogin?: string;
  lastAction?: string;
  subscriptionStartDate?: string; // تاريخ بداية الاشتراك
  renewalDate?: string;          // تاريخ التجديد السنوي
}

export interface AdminSettings {
  adminCode: string;
}

export interface Resident {
  id: number;
  fullName: string;
  residentType: 'مالك' | 'مكتري';
  buildingNumber: string;
  apartmentNumber: string;
  phoneNumber?: string;
}

export interface Shop {
  id: number;
  ownerName: string;
  buildingNumber: string;
  shopNumber: string;
  phoneNumber?: string;
}

export interface Payment {
  id: number;
  residentId: number;
  contributionMonth: string; // YYYY-MM
  amount: number;
  paymentDate: string;
  receiptNumber?: string;
}

export interface Expense {
  id: number;
  name: string;
  amount: number;
  personInCharge: string;
  date: string;
  invoiceNumber?: string;
  invoiceImage?: string; // Base64
}

export interface JanitorApartment {
  id: number;
  buildingNumber: string;
  apartmentNumber: string;
  tenantName: string;
  tenantPhoneNumber?: string;
  rentAmount: number;
}

export interface JanitorPayment {
  id: number;
  apartmentId: number;
  paymentMonth: string; // YYYY-MM
  amountPaid: number;
  paymentDate: string;
  receiptNumber?: string;
}

export interface BankTransaction {
  id: number;
  type: 'deposit' | 'withdrawal';
  person: string;
  subject: string;
  amount: number;
  date: string;
  receiptImage?: string; // Base64
}

export type ViewType = 
  | 'RESIDENTS' 
  | 'PAYMENTS' 
  | 'REPORTS' 
  | 'SHOPS' 
  | 'SHOP_PAYMENTS' 
  | 'SHOP_REPORTS' 
  | 'ANNUAL_REPORTS' 
  | 'EXPENSES' 
  | 'JANITOR_RENTALS' 
  | 'BANK' 
  | 'MEMBER_MANAGEMENT'
  | 'PROFILE';
