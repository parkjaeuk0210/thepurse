import { type Expense } from './types'

export function processSubscriptions(expenses: Expense[]): Expense[] {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()
  const currentDay = today.getDate()
  
  const newExpenses: Expense[] = []
  
  // Find all active subscriptions
  const subscriptions = expenses.filter(
    expense => expense.subscription && expense.subscription.isActive
  )
  
  subscriptions.forEach(subscription => {
    if (!subscription.subscription) return
    
    const { frequency, dayOfMonth, startDate, endDate } = subscription.subscription
    
    // Check if subscription has ended
    if (endDate && new Date(endDate) < today) {
      return
    }
    
    // Check if we need to create a new expense for this month
    const shouldCreateMonthly = frequency === 'monthly' && 
      dayOfMonth === currentDay &&
      !expenses.some(exp => 
        exp.id !== subscription.id &&
        exp.merchant === subscription.merchant &&
        exp.category === 'subscription' &&
        new Date(exp.date).getMonth() === currentMonth &&
        new Date(exp.date).getFullYear() === currentYear
      )
    
    const shouldCreateYearly = frequency === 'yearly' &&
      new Date(startDate).getDate() === currentDay &&
      new Date(startDate).getMonth() === currentMonth &&
      !expenses.some(exp => 
        exp.id !== subscription.id &&
        exp.merchant === subscription.merchant &&
        exp.category === 'subscription' &&
        new Date(exp.date).getFullYear() === currentYear
      )
    
    if (shouldCreateMonthly || shouldCreateYearly) {
      const newExpense: Expense = {
        id: `${subscription.id}-${Date.now()}`,
        cardId: subscription.cardId,
        amount: subscription.amount,
        category: 'subscription',
        merchant: subscription.merchant,
        description: `${frequency === 'monthly' ? '월간' : '연간'} 구독 - ${subscription.description || ''}`,
        date: today,
        createdAt: today,
        subscription: subscription.subscription,
      }
      
      newExpenses.push(newExpense)
    }
  })
  
  return newExpenses
}

export function getUpcomingSubscriptions(expenses: Expense[], days: number = 30): Expense[] {
  const today = new Date()
  const endDate = new Date(today)
  endDate.setDate(today.getDate() + days)
  
  const subscriptions = expenses.filter(
    expense => expense.subscription && expense.subscription.isActive
  )
  
  const upcoming: Expense[] = []
  
  subscriptions.forEach(subscription => {
    if (!subscription.subscription) return
    
    const { frequency, dayOfMonth, startDate } = subscription.subscription
    
    if (frequency === 'monthly') {
      // Check next payment date
      const nextPayment = new Date(today)
      nextPayment.setDate(dayOfMonth || new Date(startDate).getDate())
      
      if (nextPayment <= today) {
        nextPayment.setMonth(nextPayment.getMonth() + 1)
      }
      
      if (nextPayment <= endDate) {
        upcoming.push({
          ...subscription,
          date: nextPayment,
        })
      }
    } else if (frequency === 'yearly') {
      const nextPayment = new Date(startDate)
      nextPayment.setFullYear(today.getFullYear())
      
      if (nextPayment <= today) {
        nextPayment.setFullYear(nextPayment.getFullYear() + 1)
      }
      
      if (nextPayment <= endDate) {
        upcoming.push({
          ...subscription,
          date: nextPayment,
        })
      }
    }
  })
  
  return upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}