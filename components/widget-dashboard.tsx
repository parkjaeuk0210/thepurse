'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type Expense, type Budget, type SpendingGoal, CATEGORIES } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, Target, AlertCircle } from 'lucide-react'

interface WidgetDashboardProps {
  expenses: Expense[]
  budgets: Budget[]
  goals: SpendingGoal[]
}

export function WidgetDashboard({ expenses, budgets, goals }: WidgetDashboardProps) {
  // Calculate current month expenses
  const currentMonthExpenses = useMemo(() => {
    const now = new Date()
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === now.getMonth() &&
             expenseDate.getFullYear() === now.getFullYear()
    })
  }, [expenses])

  // Calculate total and daily average
  const monthTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const daysPassed = new Date().getDate()
  const dailyAverage = daysPassed > 0 ? monthTotal / daysPassed : 0

  // Calculate budget status
  const monthlyBudget = budgets.find(b => b.type === 'total' && b.period === 'monthly')
  const budgetRemaining = monthlyBudget ? monthlyBudget.amount - monthTotal : null
  const budgetPercentage = monthlyBudget ? (monthTotal / monthlyBudget.amount) * 100 : 0

  // Calculate active goals progress
  const activeGoals = goals.filter(g => g.isActive)
  const achievedGoals = activeGoals.filter(goal => {
    const now = new Date()
    const relevantExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date)
      if (goal.period === 'monthly') {
        return expenseDate.getMonth() === now.getMonth() &&
               expenseDate.getFullYear() === now.getFullYear()
      }
      return false
    }).filter(e => !goal.categoryId || e.category === goal.categoryId)
    
    const currentAmount = relevantExpenses.reduce((sum, e) => sum + e.amount, 0)
    return goal.type === 'save' ? currentAmount >= goal.targetAmount : currentAmount <= goal.targetAmount
  })

  // Top spending category
  const categoryTotals = currentMonthExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)
  
  const topCategory = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)[0]
  const topCategoryInfo = topCategory ? CATEGORIES.find(c => c.id === topCategory[0]) : null

  return (
    <div className="grid gap-4">
      {/* Quick Stats Widget */}
      <Card className="glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            이번달 지출
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-2xl font-bold">{formatCurrency(monthTotal)}</p>
              <p className="text-sm text-muted-foreground">
                일 평균: {formatCurrency(dailyAverage)}
              </p>
            </div>
            
            {monthlyBudget && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">예산 사용</span>
                  <span className={budgetPercentage > 100 ? 'text-red-500' : 'text-foreground'}>
                    {budgetPercentage.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      budgetPercentage > 100 
                        ? 'bg-red-500' 
                        : budgetPercentage > 80 
                          ? 'bg-yellow-500' 
                          : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                  />
                </div>
                {budgetRemaining !== null && (
                  <p className={`text-sm ${budgetRemaining < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {budgetRemaining < 0 ? '초과' : '남은 예산'}: {formatCurrency(Math.abs(budgetRemaining))}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Goals Progress Widget */}
      {activeGoals.length > 0 && (
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              목표 진행률
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">달성한 목표</span>
                <span className="text-lg font-bold">
                  {achievedGoals.length}/{activeGoals.length}
                </span>
              </div>
              
              {activeGoals.slice(0, 3).map(goal => {
                const now = new Date()
                const relevantExpenses = expenses.filter(e => {
                  const expenseDate = new Date(e.date)
                  if (goal.period === 'monthly') {
                    return expenseDate.getMonth() === now.getMonth() &&
                           expenseDate.getFullYear() === now.getFullYear()
                  }
                  return false
                }).filter(e => !goal.categoryId || e.category === goal.categoryId)
                
                const currentAmount = relevantExpenses.reduce((sum, e) => sum + e.amount, 0)
                const progress = goal.type === 'save' 
                  ? (currentAmount / goal.targetAmount) * 100
                  : ((goal.targetAmount - currentAmount) / goal.targetAmount) * 100
                
                return (
                  <div key={goal.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="truncate flex-1 mr-2">{goal.title}</span>
                      <span className="text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Category Widget */}
      {topCategoryInfo && (
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              최다 지출 카테고리
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${topCategoryInfo.color}`}>
                  <span className="text-lg">{topCategoryInfo.icon}</span>
                </div>
                <span className="font-medium">{topCategoryInfo.name}</span>
              </div>
              <span className="text-lg font-bold">
                {formatCurrency(topCategory[1])}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}