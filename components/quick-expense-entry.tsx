'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CATEGORIES, type Card as CardType, type Expense } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Zap, Clock, TrendingUp } from 'lucide-react'

interface QuickExpenseEntryProps {
  expenses: Expense[]
  cards: CardType[]
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void
}

interface QuickTemplate {
  merchant: string
  category: string
  amount: number
  cardId: string
  frequency: number
}

export function QuickExpenseEntry({ expenses, cards, onAddExpense }: QuickExpenseEntryProps) {
  const [quickTemplates, setQuickTemplates] = useState<QuickTemplate[]>([])
  const [recentMerchants, setRecentMerchants] = useState<string[]>([])

  useEffect(() => {
    // Analyze expense patterns
    const merchantFrequency = new Map<string, {
      count: number
      category: string
      avgAmount: number
      lastCardId: string
      amounts: number[]
    }>()

    expenses.forEach(expense => {
      const existing = merchantFrequency.get(expense.merchant)
      if (existing) {
        existing.count++
        existing.amounts.push(expense.amount)
        existing.lastCardId = expense.cardId
      } else {
        merchantFrequency.set(expense.merchant, {
          count: 1,
          category: expense.category,
          avgAmount: expense.amount,
          lastCardId: expense.cardId,
          amounts: [expense.amount]
        })
      }
    })

    // Create templates from frequent merchants
    const templates: QuickTemplate[] = []
    merchantFrequency.forEach((data, merchant) => {
      if (data.count >= 2) {
        const avgAmount = data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length
        templates.push({
          merchant,
          category: data.category,
          amount: Math.round(avgAmount),
          cardId: data.lastCardId,
          frequency: data.count
        })
      }
    })

    // Sort by frequency
    templates.sort((a, b) => b.frequency - a.frequency)
    setQuickTemplates(templates.slice(0, 6))

    // Get recent unique merchants
    const recent = expenses
      .slice(-20)
      .map(e => e.merchant)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 5)
    setRecentMerchants(recent)
  }, [expenses])

  const handleQuickAdd = (template: QuickTemplate) => {
    onAddExpense({
      cardId: template.cardId,
      amount: template.amount,
      category: template.category,
      merchant: template.merchant,
      description: '빠른 입력',
      date: new Date()
    })
  }

  const handleRecentAdd = (merchant: string) => {
    // Find the most recent expense with this merchant
    const recentExpense = expenses
      .filter(e => e.merchant === merchant)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    if (recentExpense) {
      onAddExpense({
        cardId: recentExpense.cardId,
        amount: recentExpense.amount,
        category: recentExpense.category,
        merchant: recentExpense.merchant,
        description: '빠른 입력',
        date: new Date()
      })
    }
  }

  if (quickTemplates.length === 0 && recentMerchants.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          빠른 입력
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {quickTemplates.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>자주 사용하는 지출</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {quickTemplates.map((template, index) => {
                const category = CATEGORIES.find(c => c.id === template.category)
                const card = cards.find(c => c.id === template.cardId)
                
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-3 justify-start glass-subtle hover:bg-glass/50"
                    onClick={() => handleQuickAdd(template)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${category?.color || 'bg-gray-500'}`}>
                        <span className="text-sm">{category?.icon}</span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium truncate">{template.merchant}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>{formatCurrency(template.amount)}</span>
                          <span>•</span>
                          <span>{card?.name}</span>
                        </div>
                      </div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {recentMerchants.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>최근 가맹점</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentMerchants.map((merchant) => (
                <Button
                  key={merchant}
                  variant="outline"
                  size="sm"
                  className="glass-subtle"
                  onClick={() => handleRecentAdd(merchant)}
                >
                  {merchant}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}