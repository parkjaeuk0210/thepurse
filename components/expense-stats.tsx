'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CATEGORIES, type Expense, type Budget } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, CreditCard, Calendar, Target } from 'lucide-react'

interface ExpenseStatsProps {
  expenses: Expense[]
  budgets?: Budget[]
}

export function ExpenseStats({ expenses, budgets = [] }: ExpenseStatsProps) {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const currentMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
  })

  const lastMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
    return expenseDate.getMonth() === lastMonth && expenseDate.getFullYear() === lastMonthYear
  })

  const totalCurrentMonth = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalLastMonth = lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalAllTime = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const monthlyChange = totalLastMonth > 0 
    ? ((totalCurrentMonth - totalLastMonth) / totalLastMonth) * 100 
    : 0

  const categoryTotals = currentMonthExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)

  const topCategory = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]
  const topCategoryInfo = topCategory ? CATEGORIES.find(cat => cat.id === topCategory[0]) : null

  // Calculate monthly budget status
  const monthlyBudget = budgets.find(b => b.type === 'total' && b.period === 'monthly')
  const budgetPercentage = monthlyBudget ? (totalCurrentMonth / monthlyBudget.amount) * 100 : 0
  const isOverBudget = budgetPercentage > 100

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
      <Card className="col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">이번 달 지출</CardTitle>
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalCurrentMonth)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {currentMonthExpenses.length}건의 거래
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">전월 대비</CardTitle>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            monthlyChange >= 0 ? 'bg-red-500/10' : 'bg-green-500/10'
          }`}>
            {monthlyChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${
            monthlyChange >= 0 ? 'text-red-500' : 'text-green-500'
          }`}>
            {monthlyChange >= 0 ? '+' : ''}{monthlyChange.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(Math.abs(totalCurrentMonth - totalLastMonth))} 차이
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">최다 카테고리</CardTitle>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <CreditCard className="h-4 w-4 text-purple-500" />
          </div>
        </CardHeader>
        <CardContent>
          {topCategoryInfo ? (
            <>
              <div className="text-2xl font-bold flex items-center gap-2">
                <span className="text-2xl">{topCategoryInfo.icon}</span>
                <span>{topCategoryInfo.name}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(topCategory[1])}
              </p>
            </>
          ) : (
            <div className="text-2xl font-bold">없음</div>
          )}
        </CardContent>
      </Card>

      <Card className="col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">전체 지출</CardTitle>
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalAllTime)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {expenses.length}건의 전체 거래
          </p>
        </CardContent>
      </Card>
      
      {monthlyBudget && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">월 예산 사용률</CardTitle>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isOverBudget ? 'bg-red-500/10' : 'bg-green-500/10'
            }`}>
              <Target className={`h-4 w-4 ${isOverBudget ? 'text-red-500' : 'text-green-500'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              isOverBudget ? 'text-red-500' : 'text-green-500'
            }`}>
              {budgetPercentage.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(monthlyBudget.amount)} 예산
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}