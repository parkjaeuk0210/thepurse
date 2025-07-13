'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { CATEGORIES, type Budget, type Expense } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Target, Plus, Trash2, AlertCircle } from 'lucide-react'

interface BudgetManagerProps {
  budgets: Budget[]
  expenses: Expense[]
  onAddBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDeleteBudget: (id: string) => void
  onUpdateBudget: (id: string, budget: Partial<Budget>) => void
}

export function BudgetManager({ budgets, expenses, onAddBudget, onDeleteBudget, onUpdateBudget }: BudgetManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'total' as 'total' | 'category',
    categoryId: '',
    amount: '',
    period: 'monthly' as 'monthly' | 'weekly' | 'daily',
  })

  const calculateSpent = (budget: Budget): number => {
    const now = new Date()
    const startDate = new Date()

    switch (budget.period) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'weekly':
        startDate.setDate(now.getDate() - now.getDay())
        startDate.setHours(0, 0, 0, 0)
        break
      case 'monthly':
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)
        break
    }

    return expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date)
        if (expenseDate < startDate || expenseDate > now) return false
        
        if (budget.type === 'total') return true
        return expense.category === budget.categoryId
      })
      .reduce((sum, expense) => sum + expense.amount, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.amount || (formData.type === 'category' && !formData.categoryId)) {
      alert('모든 필수 항목을 입력해주세요.')
      return
    }

    onAddBudget({
      type: formData.type,
      categoryId: formData.type === 'category' ? formData.categoryId : undefined,
      amount: parseFloat(formData.amount),
      period: formData.period,
    })

    setFormData({
      type: 'total',
      categoryId: '',
      amount: '',
      period: 'monthly',
    })
    setShowAddForm(false)
  }

  const getPeriodText = (period: string) => {
    switch (period) {
      case 'daily': return '일간'
      case 'weekly': return '주간'
      case 'monthly': return '월간'
      default: return period
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">예산 관리</CardTitle>
            <CardDescription className="mt-1">지출 목표를 설정하고 관리하세요</CardDescription>
          </div>
          <Target className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {budgets.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              설정된 예산이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {budgets.map((budget) => {
                const spent = calculateSpent(budget)
                const percentage = Math.min((spent / budget.amount) * 100, 100)
                const isOverBudget = spent > budget.amount
                const category = CATEGORIES.find(cat => cat.id === budget.categoryId)
                
                return (
                  <div
                    key={budget.id}
                    className="group glass-subtle rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {budget.type === 'category' && category ? (
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${category.color}`}>
                            <span className="text-lg">{category.icon}</span>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Target className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">
                            {budget.type === 'total' ? '전체 예산' : category?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {getPeriodText(budget.period)} 예산
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className={`font-semibold ${isOverBudget ? 'text-destructive' : ''}`}>
                            {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {percentage.toFixed(0)}% 사용
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteBudget(budget.id)}
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="w-full h-2 glass-subtle rounded-full overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isOverBudget 
                              ? 'bg-gradient-to-r from-red-500 to-red-600' 
                              : 'bg-gradient-to-r from-primary to-primary/60'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      {isOverBudget && (
                        <div className="absolute -top-6 right-0 flex items-center gap-1 text-xs text-destructive">
                          <AlertCircle className="h-3 w-3" />
                          <span>초과</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {showAddForm ? (
            <form onSubmit={handleSubmit} className="space-y-4 glass-subtle rounded-2xl p-4">
              <div className="space-y-2">
                <Label htmlFor="budgetType">예산 유형</Label>
                <Select
                  id="budgetType"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'total' | 'category' })}
                >
                  <option value="total">전체 예산</option>
                  <option value="category">카테고리별 예산</option>
                </Select>
              </div>

              {formData.type === 'category' && (
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리</Label>
                  <Select
                    id="category"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    required
                  >
                    <option value="">카테고리를 선택하세요</option>
                    {CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="period">기간</Label>
                <Select
                  id="period"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value as 'monthly' | 'weekly' | 'daily' })}
                >
                  <option value="monthly">월간</option>
                  <option value="weekly">주간</option>
                  <option value="daily">일간</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">금액</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="₩0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">추가</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </form>
          ) : (
            <Button
              onClick={() => setShowAddForm(true)}
              className="w-full h-12"
              variant="outline"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="font-medium">새 예산 추가</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}