import { type RecurringExpense, type Expense } from './types'

export function shouldProcessRecurring(recurring: RecurringExpense, now: Date = new Date()): boolean {
  if (!recurring.isActive) return false
  
  const startDate = new Date(recurring.startDate)
  if (now < startDate) return false
  
  if (recurring.endDate) {
    const endDate = new Date(recurring.endDate)
    if (now > endDate) return false
  }
  
  // If never processed, should process if start date has passed
  if (!recurring.lastProcessed) {
    return now >= startDate
  }
  
  const lastProcessed = new Date(recurring.lastProcessed)
  
  switch (recurring.frequency) {
    case 'daily':
      // Check if it's a new day
      return now.toDateString() !== lastProcessed.toDateString()
      
    case 'weekly':
      // Check if it's the right day of week and at least a week has passed
      const daysDiff = Math.floor((now.getTime() - lastProcessed.getTime()) / (1000 * 60 * 60 * 24))
      return daysDiff >= 7 && now.getDay() === recurring.dayOfWeek
      
    case 'monthly':
      // Check if it's the right day of month and a new month
      const isNewMonth = now.getMonth() !== lastProcessed.getMonth() || 
                        now.getFullYear() !== lastProcessed.getFullYear()
      const isRightDay = now.getDate() === recurring.dayOfMonth
      // Handle end of month cases (e.g., 31st on a 30-day month)
      const isLastDay = recurring.dayOfMonth! > 28 && 
                       now.getDate() === new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      return isNewMonth && (isRightDay || isLastDay)
      
    case 'yearly':
      // Check if it's a new year
      return now.getFullYear() > lastProcessed.getFullYear()
      
    default:
      return false
  }
}

export function createExpenseFromRecurring(
  recurring: RecurringExpense, 
  processDate: Date = new Date()
): Omit<Expense, 'id' | 'createdAt'> {
  return {
    cardId: recurring.cardId,
    amount: recurring.amount,
    category: recurring.category,
    merchant: recurring.merchant,
    description: recurring.description ? `[자동] ${recurring.description}` : '[자동] 반복 지출',
    date: processDate,
  }
}

export function processRecurringExpenses(
  recurringExpenses: RecurringExpense[],
  existingExpenses: Expense[],
  now: Date = new Date()
): {
  newExpenses: Omit<Expense, 'id' | 'createdAt'>[],
  updatedRecurring: RecurringExpense[]
} {
  const newExpenses: Omit<Expense, 'id' | 'createdAt'>[] = []
  const updatedRecurring: RecurringExpense[] = []
  
  recurringExpenses.forEach(recurring => {
    if (shouldProcessRecurring(recurring, now)) {
      // Create new expense
      const expense = createExpenseFromRecurring(recurring, now)
      newExpenses.push(expense)
      
      // Update recurring with new lastProcessed date
      updatedRecurring.push({
        ...recurring,
        lastProcessed: now,
        updatedAt: now,
      })
    }
  })
  
  return { newExpenses, updatedRecurring }
}