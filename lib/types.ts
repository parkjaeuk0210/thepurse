export interface Card {
  id: string
  name: string
  number: string
  color: string
  balance?: number
}

export interface Expense {
  id: string
  cardId: string
  amount: number
  category: string
  merchant: string
  description?: string
  date: Date
  createdAt: Date
  installment?: {
    totalMonths: number
    currentMonth: number
    monthlyAmount: number
  }
  subscription?: {
    frequency: 'monthly' | 'yearly'
    startDate: Date
    endDate?: Date
    isActive: boolean
    dayOfMonth?: number
  }
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
}

export interface Budget {
  id: string
  type: 'total' | 'category'
  categoryId?: string
  amount: number
  period: 'monthly' | 'weekly' | 'daily'
  createdAt: Date
  updatedAt: Date
}

export interface RecurringExpense {
  id: string
  cardId: string
  amount: number
  category: string
  merchant: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  dayOfMonth?: number // For monthly
  dayOfWeek?: number // For weekly (0-6)
  startDate: Date
  endDate?: Date
  isActive: boolean
  lastProcessed?: Date
  createdAt: Date
  updatedAt: Date
}

export interface InstallmentPayment {
  id: string
  originalExpenseId: string
  cardId: string
  totalAmount: number
  monthlyAmount: number
  totalMonths: number
  remainingMonths: number
  startDate: Date
  merchant: string
  description?: string
  category: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SpendingGoal {
  id: string
  type: 'reduce' | 'save' | 'limit'
  targetAmount: number
  currentAmount: number
  period: 'monthly' | 'weekly' | 'yearly'
  categoryId?: string
  title: string
  description?: string
  startDate: Date
  endDate?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export const CATEGORIES: Category[] = [
  { id: 'food', name: '식비', icon: '🍔', color: 'bg-orange-500 dark:bg-orange-400' },
  { id: 'transport', name: '교통비', icon: '🚌', color: 'bg-blue-500 dark:bg-blue-400' },
  { id: 'shopping', name: '쇼핑', icon: '🛍️', color: 'bg-pink-500 dark:bg-pink-400' },
  { id: 'entertainment', name: '문화/여가', icon: '🎬', color: 'bg-purple-500 dark:bg-purple-400' },
  { id: 'health', name: '의료/건강', icon: '🏥', color: 'bg-green-500 dark:bg-green-400' },
  { id: 'education', name: '교육', icon: '📚', color: 'bg-indigo-500 dark:bg-indigo-400' },
  { id: 'utilities', name: '공과금', icon: '💡', color: 'bg-yellow-500 dark:bg-yellow-400' },
  { id: 'subscription', name: '구독', icon: '🔄', color: 'bg-emerald-500 dark:bg-emerald-400' },
  { id: 'other', name: '기타', icon: '📌', color: 'bg-gray-500 dark:bg-gray-400' },
]