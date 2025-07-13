'use client'

import { useState, useEffect } from 'react'
import { ExpenseForm } from '@/components/expense-form'
import { ExpenseList } from '@/components/expense-list'
import { ExpenseStats } from '@/components/expense-stats'
import { CardManager } from '@/components/card-manager'
import { RecurringExpenseManager } from '@/components/recurring-expense-manager'
import { ThemeToggle } from '@/components/theme-toggle'
import { PullToRefresh } from '@/components/pull-to-refresh'
import { QuickExpenseEntry } from '@/components/quick-expense-entry'
import { QuickAmountPad } from '@/components/quick-amount-pad'
import { MonthlyTrendChart } from '@/components/monthly-trend-chart'
import { CardUsageChart } from '@/components/card-usage-chart'
import { ExpenseHeatmap } from '@/components/expense-heatmap'
import { MonthlySummaryReport } from '@/components/monthly-summary-report'
import { CategoryTrendAnalysis } from '@/components/category-trend-analysis'
import { SpendingGoals } from '@/components/spending-goals'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { type Card, type Expense, type Budget, type RecurringExpense, type InstallmentPayment, type SpendingGoal } from '@/lib/types'
import { processRecurringExpenses } from '@/lib/recurring-utils'
import { processSubscriptions } from '@/lib/subscription-utils'
import { haptics } from '@/lib/haptics'
import { generateId } from '@/lib/id-generator'
import { Button } from '@/components/ui/button'
import { Wallet, CreditCard, PlusCircle, BarChart3, Trophy } from 'lucide-react'

export default function Home() {
  const [cards, setCards] = useLocalStorage<Card[]>('purse-cards', [])
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('purse-expenses', [])
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('purse-budgets', [])
  const [recurringExpenses, setRecurringExpenses] = useLocalStorage<RecurringExpense[]>('purse-recurring', [])
  const [installments, setInstallments] = useLocalStorage<InstallmentPayment[]>('purse-installments', [])
  const [goals, setGoals] = useLocalStorage<SpendingGoal[]>('purse-goals', [])
  const [activeTab, setActiveTab] = useState<'expenses' | 'cards' | 'add' | 'stats' | 'goals'>('expenses')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showQuickPad, setShowQuickPad] = useState(false)

  // Process recurring expenses and subscriptions on load
  useEffect(() => {
    // Only run once on mount
    const processOnMount = () => {
      // Process recurring expenses
      const { newExpenses, updatedRecurring } = processRecurringExpenses(recurringExpenses, expenses)
      
      if (newExpenses.length > 0) {
        const processedExpenses = newExpenses.map(exp => ({
          ...exp,
          id: generateId('exp-'),
          createdAt: new Date(),
        }))
        setExpenses(prev => [...prev, ...processedExpenses])
      }
      
      if (updatedRecurring.length > 0) {
        setRecurringExpenses(prev => prev.map(r => {
          const updated = updatedRecurring.find(u => u.id === r.id)
          return updated || r
        }))
      }
      
      // Process subscriptions
      const newSubscriptionExpenses = processSubscriptions(expenses)
      if (newSubscriptionExpenses.length > 0) {
        setExpenses(prev => [...prev, ...newSubscriptionExpenses])
      }
    }

    // Run only if we have recurring expenses or subscriptions
    const hasSubscriptions = expenses.some(e => e.subscription)
    if (recurringExpenses.length > 0 || hasSubscriptions) {
      const timer = setTimeout(processOnMount, 100)
      return () => clearTimeout(timer)
    }
  }, []) // Empty dependency array - only run once on mount

  const handleAddCard = (cardData: Omit<Card, 'id'>) => {
    const newCard: Card = {
      ...cardData,
      id: generateId('card-'),
    }
    setCards([...cards, newCard])
  }

  const handleDeleteCard = (id: string) => {
    const hasExpenses = expenses.some(expense => expense.cardId === id)
    if (hasExpenses) {
      if (!confirm('이 카드에 연결된 지출 내역이 있습니다. 카드를 삭제하면 관련 지출 내역도 모두 삭제됩니다. 계속하시겠습니까?')) {
        return
      }
      setExpenses(expenses.filter(expense => expense.cardId !== id))
    }
    setCards(cards.filter(card => card.id !== id))
  }

  const handleAddExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: generateId('exp-'),
      createdAt: new Date(),
    }
    
    // If it's an installment, create installment record
    if (expenseData.installment) {
      const newInstallment: InstallmentPayment = {
        id: generateId('inst-'),
        originalExpenseId: newExpense.id,
        cardId: expenseData.cardId,
        totalAmount: expenseData.amount,
        monthlyAmount: expenseData.installment.monthlyAmount,
        totalMonths: expenseData.installment.totalMonths,
        remainingMonths: expenseData.installment.totalMonths,
        startDate: expenseData.date,
        merchant: expenseData.merchant,
        description: expenseData.description,
        category: expenseData.category,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setInstallments([...installments, newInstallment])
      
      // Update expense amount to show only first month payment
      newExpense.amount = expenseData.installment.monthlyAmount
    }
    
    setExpenses([...expenses, newExpense])
    setShowAddModal(false)
    setActiveTab('expenses')
  }

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id))
  }

  const handleAddBudget = (budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBudget: Budget = {
      ...budgetData,
      id: generateId('budget-'),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setBudgets([...budgets, newBudget])
  }

  const handleDeleteBudget = (id: string) => {
    setBudgets(budgets.filter(budget => budget.id !== id))
  }

  const handleUpdateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets(budgets.map(budget => 
      budget.id === id 
        ? { ...budget, ...updates, updatedAt: new Date() }
        : budget
    ))
  }

  const handleAddRecurring = (recurringData: Omit<RecurringExpense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecurring: RecurringExpense = {
      ...recurringData,
      id: generateId('recurring-'),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setRecurringExpenses([...recurringExpenses, newRecurring])
  }

  const handleDeleteRecurring = (id: string) => {
    setRecurringExpenses(recurringExpenses.filter(r => r.id !== id))
  }

  const handleToggleRecurring = (id: string, isActive: boolean) => {
    setRecurringExpenses(recurringExpenses.map(r => 
      r.id === id ? { ...r, isActive, updatedAt: new Date() } : r
    ))
  }

  const handleDeleteInstallment = (id: string) => {
    setInstallments(installments.filter(i => i.id !== id))
  }

  const handleToggleInstallment = (id: string, isActive: boolean) => {
    setInstallments(installments.map(i => 
      i.id === id ? { ...i, isActive, updatedAt: new Date() } : i
    ))
  }

  const handleAddGoal = (goalData: Omit<SpendingGoal, 'id' | 'createdAt' | 'updatedAt' | 'currentAmount'>) => {
    const newGoal: SpendingGoal = {
      ...goalData,
      id: generateId('goal-'),
      currentAmount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setGoals([...goals, newGoal])
  }

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id))
  }

  const handleToggleGoal = (id: string, isActive: boolean) => {
    setGoals(goals.map(g => 
      g.id === id ? { ...g, isActive, updatedAt: new Date() } : g
    ))
  }

  const handleRefresh = async () => {
    // Process recurring expenses again
    const { newExpenses, updatedRecurring } = processRecurringExpenses(recurringExpenses, expenses)
    
    if (newExpenses.length > 0) {
      const processedExpenses = newExpenses.map(exp => ({
        ...exp,
        id: Date.now().toString() + Math.random(),
        createdAt: new Date(),
      }))
      setExpenses([...expenses, ...processedExpenses])
    }
    
    if (updatedRecurring.length > 0) {
      setRecurringExpenses(recurringExpenses.map(r => {
        const updated = updatedRecurring.find(u => u.id === r.id)
        return updated || r
      }))
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const handleQuickExpense = (data: {
    amount: number
    cardId: string
    category: string
    merchant: string
  }) => {
    const newExpense: Expense = {
      id: generateId('exp-'),
      cardId: data.cardId,
      amount: data.amount,
      category: data.category,
      merchant: data.merchant,
      description: '빠른 입력',
      date: new Date(),
      createdAt: new Date(),
    }
    setExpenses([...expenses, newExpense])
    setShowQuickPad(false)
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      {/* Desktop Header */}
      <header className="hidden lg:block sticky top-0 z-40 glass border-b border-glass-border safe-top">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                The Purse
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 glass-subtle border-b border-glass-border safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold flex-1 text-center">
            {activeTab === 'expenses' && '지출 내역'}
            {activeTab === 'cards' && '카드 관리'}
            {activeTab === 'stats' && '통계'}
            {activeTab === 'goals' && '지출 목표'}
          </h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-6 py-6 max-w-7xl">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              <nav className="space-y-2">
                <button
                  onClick={() => {
                    haptics.light()
                    setActiveTab('expenses')
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all touch-manipulation ${
                    activeTab === 'expenses'
                      ? 'glass text-primary'
                      : 'hover:bg-white/50 text-muted-foreground'
                  }`}
                >
                  <Wallet className="h-5 w-5" />
                  <span className="font-medium">지출 내역</span>
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all touch-manipulation ${
                    activeTab === 'stats'
                      ? 'glass text-primary'
                      : 'hover:bg-white/50 text-muted-foreground'
                  }`}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span className="font-medium">통계</span>
                </button>
                <button
                  onClick={() => {
                    haptics.light()
                    setActiveTab('goals')
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all touch-manipulation ${
                    activeTab === 'goals'
                      ? 'glass text-primary'
                      : 'hover:bg-white/50 text-muted-foreground'
                  }`}
                >
                  <Trophy className="h-5 w-5" />
                  <span className="font-medium">지출 목표</span>
                </button>
                <button
                  onClick={() => setActiveTab('cards')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all touch-manipulation ${
                    activeTab === 'cards'
                      ? 'glass text-primary'
                      : 'hover:bg-white/50 text-muted-foreground'
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="font-medium">카드 관리</span>
                </button>
              </nav>
              
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl apple-shadow hover:bg-primary/90 transition-all"
              >
                <PlusCircle className="h-5 w-5" />
                <span className="font-medium">지출 추가</span>
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            {activeTab === 'expenses' && (
              <div className="space-y-6 animate-fade-in">
                <ExpenseStats expenses={expenses} budgets={budgets} />
                <div className="grid gap-6 lg:grid-cols-2">
                  <QuickExpenseEntry 
                    expenses={expenses}
                    cards={cards}
                    onAddExpense={handleAddExpense}
                  />
                  <QuickAmountPad
                    cards={cards}
                    onSubmit={handleQuickExpense}
                  />
                </div>
                <ExpenseList 
                  expenses={expenses} 
                  cards={cards}
                  onDeleteExpense={handleDeleteExpense}
                />
              </div>
            )}
            
            {activeTab === 'stats' && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid gap-6 lg:grid-cols-2">
                  <MonthlyTrendChart expenses={expenses} />
                  <CardUsageChart expenses={expenses} cards={cards} />
                </div>
                <MonthlySummaryReport expenses={expenses} budgets={budgets} />
                <ExpenseHeatmap expenses={expenses} />
                <CategoryTrendAnalysis expenses={expenses} />
              </div>
            )}
            
            
            {activeTab === 'cards' && (
              <div className="animate-fade-in">
                <CardManager
                  cards={cards}
                  onAddCard={handleAddCard}
                  onDeleteCard={handleDeleteCard}
                />
              </div>
            )}
            
            {activeTab === 'goals' && (
              <div className="animate-fade-in">
                <SpendingGoals
                  goals={goals}
                  expenses={expenses}
                  onAddGoal={handleAddGoal}
                  onDeleteGoal={handleDeleteGoal}
                  onToggleGoal={handleToggleGoal}
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <PullToRefresh onRefresh={handleRefresh}>
            {activeTab === 'expenses' && (
              <div className="space-y-4 animate-fade-in">
                <ExpenseStats expenses={expenses} budgets={budgets} />
                {expenses.length > 0 && (
                  <QuickExpenseEntry 
                    expenses={expenses}
                    cards={cards}
                    onAddExpense={handleAddExpense}
                  />
                )}
                <ExpenseList 
                  expenses={expenses} 
                  cards={cards}
                  onDeleteExpense={handleDeleteExpense}
                />
              </div>
            )}
          
          {activeTab === 'stats' && (
            <div className="space-y-4 animate-fade-in">
              <MonthlyTrendChart expenses={expenses} />
              <CardUsageChart expenses={expenses} cards={cards} />
              <MonthlySummaryReport expenses={expenses} budgets={budgets} />
              <ExpenseHeatmap expenses={expenses} />
              <CategoryTrendAnalysis expenses={expenses} />
            </div>
          )}
          
          
          {activeTab === 'cards' && (
            <div className="animate-fade-in">
              <CardManager
                cards={cards}
                onAddCard={handleAddCard}
                onDeleteCard={handleDeleteCard}
              />
            </div>
          )}
          
          {activeTab === 'goals' && (
            <div className="animate-fade-in">
              <SpendingGoals
                goals={goals}
                expenses={expenses}
                onAddGoal={handleAddGoal}
                onDeleteGoal={handleDeleteGoal}
                onToggleGoal={handleToggleGoal}
              />
            </div>
          )}
          </PullToRefresh>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass border-t border-glass-border safe-bottom z-50">
        <div className="flex justify-around items-center px-1 py-2">
          <button
            onClick={() => {
              haptics.light()
              setActiveTab('expenses')
            }}
            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all touch-manipulation ${
              activeTab === 'expenses'
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <Wallet className="h-5 w-5" />
            <span className="text-[9px] font-medium">지출</span>
          </button>
          
          <button
            onClick={() => {
              haptics.light()
              setActiveTab('stats')
            }}
            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all touch-manipulation ${
              activeTab === 'stats'
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-[9px] font-medium">통계</span>
          </button>
          
          <button
            onClick={() => {
              haptics.medium()
              setShowAddModal(true)
            }}
            className="flex flex-col items-center gap-1 py-2 px-1.5 rounded-xl text-primary"
          >
            <div className="w-11 h-11 -mt-3 bg-primary rounded-2xl flex items-center justify-center apple-shadow">
              <PlusCircle className="h-5 w-5 text-primary-foreground" />
            </div>
          </button>
          
          <button
            onClick={() => {
              haptics.light()
              setActiveTab('goals')
            }}
            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all touch-manipulation ${
              activeTab === 'goals'
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <Trophy className="h-5 w-5" />
            <span className="text-[9px] font-medium">목표</span>
          </button>
          
          <button
            onClick={() => {
              haptics.light()
              setActiveTab('cards')
            }}
            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all touch-manipulation ${
              activeTab === 'cards'
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <CreditCard className="h-5 w-5" />
            <span className="text-[9px] font-medium">카드</span>
          </button>
        </div>
      </nav>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-lg glass rounded-t-3xl lg:rounded-3xl animate-slide-up lg:animate-scale-in max-h-[90vh] overflow-y-auto z-50">
            <div className="sticky top-0 glass-subtle px-6 py-4 border-b border-glass-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">새 지출 추가</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex gap-3 mb-4">
                <Button
                  variant={showQuickPad ? "outline" : "default"}
                  onClick={() => setShowQuickPad(false)}
                  className="flex-1"
                >
                  일반 입력
                </Button>
                <Button
                  variant={showQuickPad ? "default" : "outline"}
                  onClick={() => setShowQuickPad(true)}
                  className="flex-1"
                >
                  빠른 입력
                </Button>
              </div>
              {showQuickPad ? (
                <QuickAmountPad
                  cards={cards}
                  onSubmit={(data) => {
                    handleQuickExpense(data)
                    setShowAddModal(false)
                  }}
                />
              ) : (
                <ExpenseForm cards={cards} onAddExpense={handleAddExpense} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}