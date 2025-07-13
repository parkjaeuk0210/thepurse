'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { type Expense, type Budget, CATEGORIES } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Calendar, TrendingUp, TrendingDown, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { haptics } from '@/lib/haptics'

interface MonthlySummaryReportProps {
  expenses: Expense[]
  budgets: Budget[]
  className?: string
}

export function MonthlySummaryReport({ expenses, budgets, className }: MonthlySummaryReportProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  const changeMonth = (direction: 'prev' | 'next') => {
    haptics.light()
    const newDate = new Date(selectedDate)
    newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1))
    setSelectedDate(newDate)
  }
  
  const monthlyData = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    
    // Filter expenses for selected month
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getFullYear() === year && expenseDate.getMonth() === month
    })
    
    // Calculate total
    const totalAmount = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    
    // Calculate by category
    const categoryBreakdown = CATEGORIES.map(category => {
      const categoryExpenses = monthlyExpenses.filter(expense => expense.category === category.id)
      const amount = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      const count = categoryExpenses.length
      const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0
      
      return {
        ...category,
        amount,
        count,
        percentage,
        expenses: categoryExpenses,
      }
    }).filter(cat => cat.amount > 0)
      .sort((a, b) => b.amount - a.amount)
    
    // Calculate daily average
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const dailyAverage = totalAmount / daysInMonth
    
    // Get previous month data for comparison
    const prevMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      const prevMonth = month === 0 ? 11 : month - 1
      const prevYear = month === 0 ? year - 1 : year
      return expenseDate.getFullYear() === prevYear && expenseDate.getMonth() === prevMonth
    })
    const prevMonthTotal = prevMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    
    // Calculate month-over-month change
    const monthChange = prevMonthTotal > 0 
      ? ((totalAmount - prevMonthTotal) / prevMonthTotal) * 100 
      : 0
    
    // Get budget information
    const monthlyBudget = budgets.find(b => b.period === 'monthly' && b.type === 'total')
    const budgetUsage = monthlyBudget ? (totalAmount / monthlyBudget.amount) * 100 : null
    
    // Find biggest expense
    const biggestExpense = monthlyExpenses.sort((a, b) => b.amount - a.amount)[0]
    
    // Count subscription expenses
    const subscriptionExpenses = monthlyExpenses.filter(e => e.category === 'subscription')
    const subscriptionTotal = subscriptionExpenses.reduce((sum, e) => sum + e.amount, 0)
    
    return {
      year,
      month,
      totalAmount,
      categoryBreakdown,
      dailyAverage,
      monthChange,
      budgetUsage,
      biggestExpense,
      subscriptionTotal,
      subscriptionCount: subscriptionExpenses.length,
      totalCount: monthlyExpenses.length,
    }
  }, [selectedDate, expenses, budgets])
  
  const exportReport = () => {
    haptics.medium()
    // TODO: Implement CSV export
    alert('리포트 내보내기 기능은 준비 중입니다')
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            월별 지출 요약
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[100px] text-center">
              {selectedDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeMonth('next')}
              disabled={selectedDate >= new Date()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="glass-subtle rounded-xl p-4">
            <p className="text-sm text-muted-foreground">총 지출</p>
            <p className="text-2xl font-bold">{formatCurrency(monthlyData.totalAmount)}</p>
            {monthlyData.monthChange !== 0 && (
              <div className="flex items-center gap-1 mt-1">
                {monthlyData.monthChange > 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-500">
                      +{monthlyData.monthChange.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500">
                      {monthlyData.monthChange.toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="glass-subtle rounded-xl p-4">
            <p className="text-sm text-muted-foreground">일평균 지출</p>
            <p className="text-2xl font-bold">{formatCurrency(monthlyData.dailyAverage)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              총 {monthlyData.totalCount}건
            </p>
          </div>
          
          <div className="glass-subtle rounded-xl p-4">
            <p className="text-sm text-muted-foreground">예산 사용률</p>
            {monthlyData.budgetUsage !== null ? (
              <>
                <p className="text-2xl font-bold">{monthlyData.budgetUsage.toFixed(0)}%</p>
                <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      monthlyData.budgetUsage > 100 ? 'bg-red-500' : 
                      monthlyData.budgetUsage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(monthlyData.budgetUsage, 100)}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-lg text-muted-foreground">예산 미설정</p>
            )}
          </div>
        </div>
        
        {/* Category Breakdown */}
        <div>
          <h3 className="font-medium mb-3">카테고리별 지출</h3>
          <div className="space-y-3">
            {monthlyData.categoryBreakdown.map(category => (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.color}`}>
                      <span className="text-sm">{category.icon}</span>
                    </div>
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-muted-foreground">({category.count}건)</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(category.amount)}</p>
                    <p className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${category.color} opacity-50 transition-all`}
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Insights */}
        <div className="space-y-3">
          <h3 className="font-medium">이달의 인사이트</h3>
          
          {monthlyData.biggestExpense && (
            <div className="glass-subtle rounded-lg p-3">
              <p className="text-sm text-muted-foreground">최대 지출</p>
              <p className="font-medium">{monthlyData.biggestExpense.merchant}</p>
              <p className="text-sm font-semibold">{formatCurrency(monthlyData.biggestExpense.amount)}</p>
            </div>
          )}
          
          {monthlyData.subscriptionCount > 0 && (
            <div className="glass-subtle rounded-lg p-3">
              <p className="text-sm text-muted-foreground">구독 서비스</p>
              <p className="font-medium">{monthlyData.subscriptionCount}개 구독 중</p>
              <p className="text-sm font-semibold">{formatCurrency(monthlyData.subscriptionTotal)}</p>
            </div>
          )}
          
          {monthlyData.categoryBreakdown[0] && (
            <div className="glass-subtle rounded-lg p-3">
              <p className="text-sm text-muted-foreground">가장 많이 쓴 카테고리</p>
              <p className="font-medium">
                {monthlyData.categoryBreakdown[0].icon} {monthlyData.categoryBreakdown[0].name}
              </p>
              <p className="text-sm font-semibold">
                {formatCurrency(monthlyData.categoryBreakdown[0].amount)} 
                ({monthlyData.categoryBreakdown[0].percentage.toFixed(0)}%)
              </p>
            </div>
          )}
        </div>
        
        {/* Export Button */}
        <Button
          onClick={exportReport}
          variant="outline"
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          리포트 내보내기
        </Button>
      </CardContent>
    </Card>
  )
}