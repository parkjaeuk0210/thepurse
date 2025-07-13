'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CATEGORIES, type Expense } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface ExpenseChartProps {
  expenses: Expense[]
}

export function ExpenseChart({ expenses }: ExpenseChartProps) {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const currentMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
  })

  const categoryTotals = currentMonthExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([categoryId, total]) => ({
      category: CATEGORIES.find(cat => cat.id === categoryId)!,
      total,
    }))

  const maxTotal = Math.max(...sortedCategories.map(item => item.total), 1)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">카테고리별 지출</CardTitle>
            <CardDescription>이번 달 지출 현황</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedCategories.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              이번 달 지출 내역이 없습니다.
            </p>
          ) : (
            sortedCategories.map(({ category, total }) => (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${category.color}`}>
                      <span className="text-lg">{category.icon}</span>
                    </div>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {((total / currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0)) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold">{formatCurrency(total)}</span>
                </div>
                <div className="w-full h-2 glass-subtle rounded-full overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                    style={{ width: `${(total / maxTotal) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}