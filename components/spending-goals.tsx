'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type SpendingGoal, type Expense, CATEGORIES } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Target, TrendingDown, PiggyBank, Trophy, Plus, X, AlertCircle } from 'lucide-react'
import { haptics } from '@/lib/haptics'

interface SpendingGoalsProps {
  goals: SpendingGoal[]
  expenses: Expense[]
  onAddGoal: (goal: Omit<SpendingGoal, 'id' | 'createdAt' | 'updatedAt' | 'currentAmount'>) => void
  onDeleteGoal: (id: string) => void
  onToggleGoal: (id: string, isActive: boolean) => void
}

export function SpendingGoals({
  goals,
  expenses,
  onAddGoal,
  onDeleteGoal,
  onToggleGoal,
}: SpendingGoalsProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'reduce' as 'reduce' | 'save' | 'limit',
    title: '',
    description: '',
    targetAmount: '',
    period: 'monthly' as 'monthly' | 'weekly' | 'yearly',
    categoryId: '',
  })

  const goalsWithProgress = useMemo(() => {
    return goals.map(goal => {
      // Calculate current amount based on goal type and period
      const now = new Date()
      let relevantExpenses: Expense[] = []
      
      // Filter expenses by period
      switch (goal.period) {
        case 'monthly':
          relevantExpenses = expenses.filter(e => {
            const expenseDate = new Date(e.date)
            return expenseDate.getMonth() === now.getMonth() &&
                   expenseDate.getFullYear() === now.getFullYear()
          })
          break
        case 'weekly':
          const weekStart = new Date(now)
          weekStart.setDate(now.getDate() - now.getDay())
          weekStart.setHours(0, 0, 0, 0)
          relevantExpenses = expenses.filter(e => new Date(e.date) >= weekStart)
          break
        case 'yearly':
          relevantExpenses = expenses.filter(e => {
            const expenseDate = new Date(e.date)
            return expenseDate.getFullYear() === now.getFullYear()
          })
          break
      }
      
      // Filter by category if specified
      if (goal.categoryId) {
        relevantExpenses = relevantExpenses.filter(e => e.category === goal.categoryId)
      }
      
      const currentAmount = relevantExpenses.reduce((sum, e) => sum + e.amount, 0)
      const progress = goal.type === 'save' 
        ? (currentAmount / goal.targetAmount) * 100
        : ((goal.targetAmount - currentAmount) / goal.targetAmount) * 100
      
      const isAchieved = goal.type === 'save' 
        ? currentAmount >= goal.targetAmount
        : currentAmount <= goal.targetAmount
      
      return {
        ...goal,
        currentAmount,
        progress: Math.max(0, Math.min(100, progress)),
        isAchieved,
        relevantExpenses,
      }
    })
  }, [goals, expenses])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.targetAmount) {
      haptics.error()
      alert('목표 이름과 금액을 입력해주세요')
      return
    }
    
    haptics.success()
    onAddGoal({
      type: formData.type,
      title: formData.title,
      description: formData.description,
      targetAmount: parseFloat(formData.targetAmount),
      period: formData.period,
      categoryId: formData.categoryId || undefined,
      startDate: new Date(),
      isActive: true,
    })
    
    setFormData({
      type: 'reduce',
      title: '',
      description: '',
      targetAmount: '',
      period: 'monthly',
      categoryId: '',
    })
    setShowAddForm(false)
  }

  const getGoalIcon = (type: 'reduce' | 'save' | 'limit') => {
    switch (type) {
      case 'reduce':
        return <TrendingDown className="h-5 w-5" />
      case 'save':
        return <PiggyBank className="h-5 w-5" />
      case 'limit':
        return <Target className="h-5 w-5" />
    }
  }

  const getGoalTypeLabel = (type: 'reduce' | 'save' | 'limit') => {
    switch (type) {
      case 'reduce':
        return '지출 줄이기'
      case 'save':
        return '저축 목표'
      case 'limit':
        return '지출 한도'
    }
  }

  const getPeriodLabel = (period: 'monthly' | 'weekly' | 'yearly') => {
    switch (period) {
      case 'monthly':
        return '월간'
      case 'weekly':
        return '주간'
      case 'yearly':
        return '연간'
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              달성한 목표
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {goalsWithProgress.filter(g => g.isActive && g.isAchieved).length}개
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              진행중인 목표
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {goalsWithProgress.filter(g => g.isActive && !g.isAchieved).length}개
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <PiggyBank className="h-4 w-4" />
              이번달 절약
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(
                goalsWithProgress
                  .filter(g => g.isActive && g.type === 'reduce' && g.period === 'monthly')
                  .reduce((sum, g) => sum + Math.max(0, g.targetAmount - g.currentAmount), 0)
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>지출 목표</CardTitle>
              <CardDescription>지출을 관리하고 절약 목표를 달성하세요</CardDescription>
            </div>
            <Button
              onClick={() => {
                haptics.light()
                setShowAddForm(!showAddForm)
              }}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              목표 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Goal Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="p-4 glass-subtle rounded-xl space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>목표 유형</Label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg glass-subtle"
                  >
                    <option value="reduce">지출 줄이기</option>
                    <option value="save">저축 목표</option>
                    <option value="limit">지출 한도</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>기간</Label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg glass-subtle"
                  >
                    <option value="weekly">주간</option>
                    <option value="monthly">월간</option>
                    <option value="yearly">연간</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>목표 이름</Label>
                <Input
                  placeholder="예: 커피 지출 줄이기"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>목표 금액</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>카테고리 (선택)</Label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg glass-subtle"
                  >
                    <option value="">전체 카테고리</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>설명 (선택)</Label>
                <Input
                  placeholder="목표에 대한 설명"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  목표 추가
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  취소
                </Button>
              </div>
            </form>
          )}

          {/* Goals */}
          {goalsWithProgress.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>아직 설정한 목표가 없습니다</p>
              <p className="text-sm mt-1">목표를 추가하여 지출을 관리하세요</p>
            </div>
          ) : (
            <div className="space-y-3">
              {goalsWithProgress.map(goal => {
                const category = CATEGORIES.find(c => c.id === goal.categoryId)
                
                return (
                  <div
                    key={goal.id}
                    className={`p-4 rounded-xl transition-all ${
                      goal.isActive ? 'glass-subtle' : 'glass-subtle opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          goal.isAchieved ? 'bg-green-500/20' : 'bg-primary/20'
                        }`}>
                          {goal.isAchieved ? (
                            <Trophy className="h-5 w-5 text-green-500" />
                          ) : (
                            getGoalIcon(goal.type)
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{goal.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">
                              {getGoalTypeLabel(goal.type)} · {getPeriodLabel(goal.period)}
                            </span>
                            {category && (
                              <span className="text-sm text-muted-foreground">
                                · {category.icon} {category.name}
                              </span>
                            )}
                          </div>
                          {goal.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {goal.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            haptics.light()
                            onToggleGoal(goal.id, !goal.isActive)
                          }}
                        >
                          {goal.isActive ? '일시정지' : '재개'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            haptics.heavy()
                            if (confirm('이 목표를 삭제하시겠습니까?')) {
                              onDeleteGoal(goal.id)
                            }
                          }}
                          className="text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {goal.type === 'save' ? '저축액' : '현재 지출'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                          </span>
                          <span className={`text-xs font-semibold ${
                            goal.isAchieved 
                              ? 'text-green-500' 
                              : goal.progress > 80 
                                ? 'text-yellow-500' 
                                : 'text-primary'
                          }`}>
                            ({Math.round(goal.progress)}%)
                          </span>
                        </div>
                      </div>
                      
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            goal.isAchieved 
                              ? 'bg-green-500' 
                              : goal.progress > 80 
                                ? 'bg-yellow-500' 
                                : 'bg-primary'
                          }`}
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      
                      {goal.type === 'limit' && goal.currentAmount > goal.targetAmount && (
                        <div className="flex items-center gap-2 text-sm text-red-500">
                          <AlertCircle className="h-4 w-4" />
                          <span>한도 초과: {formatCurrency(goal.currentAmount - goal.targetAmount)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}