'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type Card as CardType } from '@/lib/types'
import { CreditCard, Plus, Trash2 } from 'lucide-react'

interface CardManagerProps {
  cards: CardType[]
  onAddCard: (card: Omit<CardType, 'id'>) => void
  onDeleteCard: (id: string) => void
}

const CARD_COLORS = [
  { name: '블루', value: 'bg-gradient-to-br from-blue-400 to-blue-600' },
  { name: '그린', value: 'bg-gradient-to-br from-green-400 to-green-600' },
  { name: '퍼플', value: 'bg-gradient-to-br from-purple-400 to-purple-600' },
  { name: '레드', value: 'bg-gradient-to-br from-red-400 to-red-600' },
  { name: '오렌지', value: 'bg-gradient-to-br from-orange-400 to-orange-600' },
  { name: '블랙', value: 'bg-gradient-to-br from-gray-700 to-gray-900' },
]

export function CardManager({ cards, onAddCard, onDeleteCard }: CardManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    color: 'bg-blue-500',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.number) {
      alert('카드 이름과 번호를 입력해주세요.')
      return
    }

    onAddCard({
      name: formData.name,
      number: formData.number,
      color: formData.color,
    })

    setFormData({
      name: '',
      number: '',
      color: 'bg-blue-500',
    })
    setShowAddForm(false)
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="text-2xl">카드 관리</CardTitle>
          <CardDescription className="mt-1">지출을 추적할 카드를 추가하고 관리하세요</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cards.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              등록된 카드가 없습니다.
            </p>
          ) : (
            <div className="grid gap-3">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="group relative"
                >
                  <div className={`relative h-48 rounded-2xl p-6 ${card.color} text-white apple-shadow-lg overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    <div className="relative z-10">
                      <CreditCard className="h-8 w-8 mb-8" />
                      <p className="text-lg font-medium tracking-wide mb-2">{card.number}</p>
                      <p className="text-xl font-semibold">{card.name}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteCard(card.id)}
                      className="absolute top-4 right-4 h-8 w-8 text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showAddForm ? (
            <form onSubmit={handleSubmit} className="space-y-4 glass-subtle rounded-2xl p-4">
              <div className="space-y-2">
                <Label htmlFor="cardName">카드 이름</Label>
                <Input
                  id="cardName"
                  type="text"
                  placeholder="예: 신한카드"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">카드 번호</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="예: 1234-****-****-5678"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardColor">카드 색상</Label>
                <div className="grid grid-cols-3 gap-2">
                  {CARD_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`h-12 rounded-xl ${color.value} transition-all ${
                        formData.color === color.value ? 'ring-2 ring-offset-2 ring-primary scale-95' : ''
                      }`}
                      onClick={() => setFormData({ ...formData, color: color.value })}
                    >
                      <span className="text-white text-sm font-medium">{color.name}</span>
                    </button>
                  ))}
                </div>
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
              <span className="font-medium">새 카드 추가</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}