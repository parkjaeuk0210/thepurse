'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { CATEGORIES, type Card as CardType, type Expense } from '@/lib/types'
import { haptics } from '@/lib/haptics'
import { formatCurrency } from '@/lib/utils'

interface ExpenseFormProps {
  cards: CardType[]
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void
}

export function ExpenseForm({ cards, onAddExpense }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    cardId: '',
    amount: '',
    category: '',
    merchant: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    isInstallment: false,
    installmentMonths: '3',
    subscriptionFrequency: 'monthly' as 'monthly' | 'yearly',
    subscriptionEndDate: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.cardId || !formData.amount || !formData.category || !formData.merchant) {
      haptics.error()
      alert('모든 필수 항목을 입력해주세요.')
      return
    }

    const totalAmount = parseFloat(formData.amount)
    const expense: Omit<Expense, 'id' | 'createdAt'> = {
      cardId: formData.cardId,
      amount: totalAmount,
      category: formData.category,
      merchant: formData.merchant,
      description: formData.description,
      date: new Date(formData.date),
    }

    if (formData.isInstallment) {
      const months = parseInt(formData.installmentMonths)
      expense.installment = {
        totalMonths: months,
        currentMonth: 1,
        monthlyAmount: totalAmount / months,
      }
    }

    // Add subscription info if category is subscription
    if (formData.category === 'subscription') {
      const date = new Date(formData.date)
      expense.subscription = {
        frequency: formData.subscriptionFrequency,
        startDate: date,
        endDate: formData.subscriptionEndDate ? new Date(formData.subscriptionEndDate) : undefined,
        isActive: true,
        dayOfMonth: date.getDate(),
      }
    }

    haptics.success()
    onAddExpense(expense)

    setFormData({
      cardId: '',
      amount: '',
      category: '',
      merchant: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      isInstallment: false,
      installmentMonths: '3',
      subscriptionFrequency: 'monthly',
      subscriptionEndDate: '',
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="card">카드</Label>
          <Select
            id="card"
            value={formData.cardId}
            onChange={(e) => setFormData({ ...formData, cardId: e.target.value })}
            required
          >
            <option value="">카드를 선택하세요</option>
            {cards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.name} ({card.number})
              </option>
            ))}
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

        <div className="space-y-2">
          <Label htmlFor="category">카테고리</Label>
          <Select
            id="category"
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

        <div className="space-y-2">
          <Label htmlFor="merchant">가맹점</Label>
          <Input
            id="merchant"
            type="text"
            placeholder="가맹점명 입력"
            value={formData.merchant}
            onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">날짜</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">메모</Label>
            <Input
              id="description"
              type="text"
              placeholder="선택사항"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        {/* Subscription Option */}
        {formData.category === 'subscription' && (
          <div className="space-y-3 p-4 glass-subtle rounded-lg">
            <p className="text-sm font-medium">구독 설정</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subscriptionFrequency">결제 주기</Label>
                <Select
                  id="subscriptionFrequency"
                  value={formData.subscriptionFrequency}
                  onChange={(e) => setFormData({ ...formData, subscriptionFrequency: e.target.value as 'monthly' | 'yearly' })}
                >
                  <option value="monthly">매월</option>
                  <option value="yearly">매년</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subscriptionEndDate">종료일 (선택)</Label>
                <Input
                  id="subscriptionEndDate"
                  type="date"
                  value={formData.subscriptionEndDate}
                  onChange={(e) => setFormData({ ...formData, subscriptionEndDate: e.target.value })}
                  min={formData.date}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              매달 {new Date(formData.date).getDate()}일에 자동으로 지출이 기록됩니다
            </p>
          </div>
        )}

        {/* Installment Option - Hide if subscription */}
        {formData.category !== 'subscription' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="installment"
                checked={formData.isInstallment}
                onChange={(e) => setFormData({ ...formData, isInstallment: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label htmlFor="installment" className="cursor-pointer">
                할부로 구매
              </Label>
            </div>
            
            {formData.isInstallment && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="installmentMonths">할부 개월</Label>
                <Select
                  id="installmentMonths"
                  value={formData.installmentMonths}
                  onChange={(e) => setFormData({ ...formData, installmentMonths: e.target.value })}
                >
                  <option value="2">2개월</option>
                  <option value="3">3개월</option>
                  <option value="6">6개월</option>
                  <option value="10">10개월</option>
                  <option value="12">12개월</option>
                  <option value="24">24개월</option>
                  <option value="36">36개월</option>
                </Select>
                {formData.amount && (
                  <p className="text-sm text-muted-foreground">
                    월 {formatCurrency(parseFloat(formData.amount) / parseInt(formData.installmentMonths))} × {formData.installmentMonths}개월
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" size="lg">
        추가하기
      </Button>
    </form>
  )
}