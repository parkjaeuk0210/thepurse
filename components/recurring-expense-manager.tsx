'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { CATEGORIES, type Card as CardType, type RecurringExpense } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Repeat, Plus, Trash2, Calendar, Pause, Play } from 'lucide-react'

interface RecurringExpenseManagerProps {
  recurringExpenses: RecurringExpense[]
  cards: CardType[]
  onAddRecurring: (expense: Omit<RecurringExpense, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDeleteRecurring: (id: string) => void
  onToggleRecurring: (id: string, isActive: boolean) => void
}

const FREQUENCIES = [
  { value: 'daily', label: '매일' },
  { value: 'weekly', label: '매주' },
  { value: 'monthly', label: '매월' },
  { value: 'yearly', label: '매년' },
]

const DAYS_OF_WEEK = [
  { value: 0, label: '일요일' },
  { value: 1, label: '월요일' },
  { value: 2, label: '화요일' },
  { value: 3, label: '수요일' },
  { value: 4, label: '목요일' },
  { value: 5, label: '금요일' },
  { value: 6, label: '토요일' },
]

export function RecurringExpenseManager({ 
  recurringExpenses, 
  cards, 
  onAddRecurring, 
  onDeleteRecurring,
  onToggleRecurring 
}: RecurringExpenseManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    cardId: '',
    amount: '',
    category: '',
    merchant: '',
    description: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    dayOfMonth: '1',
    dayOfWeek: '1',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.cardId || !formData.amount || !formData.category || !formData.merchant) {
      alert('모든 필수 항목을 입력해주세요.')
      return
    }

    const recurringData: Omit<RecurringExpense, 'id' | 'createdAt' | 'updatedAt'> = {
      cardId: formData.cardId,
      amount: parseFloat(formData.amount),
      category: formData.category,
      merchant: formData.merchant,
      description: formData.description || undefined,
      frequency: formData.frequency,
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      isActive: true,
    }

    if (formData.frequency === 'monthly') {
      recurringData.dayOfMonth = parseInt(formData.dayOfMonth)
    } else if (formData.frequency === 'weekly') {
      recurringData.dayOfWeek = parseInt(formData.dayOfWeek)
    }

    onAddRecurring(recurringData)

    setFormData({
      cardId: '',
      amount: '',
      category: '',
      merchant: '',
      description: '',
      frequency: 'monthly',
      dayOfMonth: '1',
      dayOfWeek: '1',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    })
    setShowAddForm(false)
  }

  const getNextOccurrence = (recurring: RecurringExpense): Date => {
    const now = new Date()
    const next = new Date()

    switch (recurring.frequency) {
      case 'daily':
        next.setDate(now.getDate() + 1)
        break
      case 'weekly':
        const daysUntilNext = (recurring.dayOfWeek! - now.getDay() + 7) % 7 || 7
        next.setDate(now.getDate() + daysUntilNext)
        break
      case 'monthly':
        next.setMonth(now.getMonth() + 1)
        next.setDate(recurring.dayOfMonth!)
        break
      case 'yearly':
        next.setFullYear(now.getFullYear() + 1)
        break
    }

    return next
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">반복 지출</CardTitle>
            <CardDescription className="mt-1">정기적으로 발생하는 지출을 관리하세요</CardDescription>
          </div>
          <Repeat className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recurringExpenses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              등록된 반복 지출이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {recurringExpenses.map((recurring) => {
                const card = cards.find(c => c.id === recurring.cardId)
                const category = CATEGORIES.find(c => c.id === recurring.category)
                const nextDate = getNextOccurrence(recurring)
                
                return (
                  <div
                    key={recurring.id}
                    className={`group glass-subtle rounded-2xl p-4 ${
                      !recurring.isActive ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${category?.color || 'bg-gray-500'}`}>
                          <span className="text-lg">{category?.icon}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{recurring.merchant}</p>
                            {!recurring.isActive && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                일시정지
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{card?.name}</span>
                            <span>•</span>
                            <span>{FREQUENCIES.find(f => f.value === recurring.frequency)?.label}</span>
                            {recurring.frequency === 'monthly' && (
                              <>
                                <span>•</span>
                                <span>매월 {recurring.dayOfMonth}일</span>
                              </>
                            )}
                            {recurring.frequency === 'weekly' && (
                              <>
                                <span>•</span>
                                <span>{DAYS_OF_WEEK.find(d => d.value === recurring.dayOfWeek)?.label}</span>
                              </>
                            )}
                          </div>
                          {recurring.isActive && (
                            <p className="text-xs text-muted-foreground mt-1">
                              다음 예정일: {formatDate(nextDate)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">
                          {formatCurrency(recurring.amount)}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onToggleRecurring(recurring.id, !recurring.isActive)}
                            className="h-8 w-8"
                          >
                            {recurring.isActive ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteRecurring(recurring.id)}
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {showAddForm ? (
            <form onSubmit={handleSubmit} className="space-y-4 glass-subtle rounded-2xl p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recurring-card">카드</Label>
                  <Select
                    id="recurring-card"
                    value={formData.cardId}
                    onChange={(e) => setFormData({ ...formData, cardId: e.target.value })}
                    required
                  >
                    <option value="">카드를 선택하세요</option>
                    {cards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurring-category">카테고리</Label>
                  <Select
                    id="recurring-category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recurring-merchant">가맹점</Label>
                  <Input
                    id="recurring-merchant"
                    type="text"
                    placeholder="예: 넷플릭스"
                    value={formData.merchant}
                    onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurring-amount">금액</Label>
                  <Input
                    id="recurring-amount"
                    type="number"
                    placeholder="₩0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recurring-frequency">주기</Label>
                  <Select
                    id="recurring-frequency"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  >
                    {FREQUENCIES.map((freq) => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </Select>
                </div>

                {formData.frequency === 'monthly' && (
                  <div className="space-y-2">
                    <Label htmlFor="recurring-day">매월 날짜</Label>
                    <Select
                      id="recurring-day"
                      value={formData.dayOfMonth}
                      onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <option key={day} value={day}>
                          {day}일
                        </option>
                      ))}
                    </Select>
                  </div>
                )}

                {formData.frequency === 'weekly' && (
                  <div className="space-y-2">
                    <Label htmlFor="recurring-weekday">요일</Label>
                    <Select
                      id="recurring-weekday"
                      value={formData.dayOfWeek}
                      onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recurring-start">시작일</Label>
                  <Input
                    id="recurring-start"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurring-end">종료일 (선택)</Label>
                  <Input
                    id="recurring-end"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recurring-description">메모 (선택)</Label>
                <Input
                  id="recurring-description"
                  type="text"
                  placeholder="예: 프리미엄 요금제"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              <span className="font-medium">반복 지출 추가</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}