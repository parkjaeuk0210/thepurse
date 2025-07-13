'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CATEGORIES, type Card as CardType } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Calculator, Check, Delete } from 'lucide-react'
import { haptics } from '@/lib/haptics'

interface QuickAmountPadProps {
  cards: CardType[]
  defaultCardId?: string
  defaultCategory?: string
  onSubmit: (data: {
    amount: number
    cardId: string
    category: string
    merchant: string
  }) => void
}

export function QuickAmountPad({ cards, defaultCardId, defaultCategory, onSubmit }: QuickAmountPadProps) {
  const [amount, setAmount] = useState('0')
  const [cardId, setCardId] = useState(defaultCardId || cards[0]?.id || '')
  const [category, setCategory] = useState(defaultCategory || 'food')
  const [merchant, setMerchant] = useState('')
  const [showMerchantInput, setShowMerchantInput] = useState(false)

  const handleNumberClick = (num: string) => {
    haptics.light()
    if (amount === '0') {
      setAmount(num)
    } else if (amount.length < 10) {
      setAmount(amount + num)
    }
  }

  const handleBackspace = () => {
    haptics.light()
    if (amount.length > 1) {
      setAmount(amount.slice(0, -1))
    } else {
      setAmount('0')
    }
  }

  const handleClear = () => {
    haptics.medium()
    setAmount('0')
  }

  const handleSubmit = () => {
    if (!showMerchantInput) {
      haptics.medium()
      setShowMerchantInput(true)
      return
    }

    if (parseFloat(amount) > 0 && cardId && category && merchant) {
      haptics.success()
      onSubmit({
        amount: parseFloat(amount),
        cardId,
        category,
        merchant
      })
      setAmount('0')
      setMerchant('')
      setShowMerchantInput(false)
    } else {
      haptics.error()
    }
  }

  const quickAmounts = [5000, 10000, 20000, 50000]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          빠른 금액 입력
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Display */}
        <div className="text-center">
          <p className="text-3xl font-bold">
            {formatCurrency(parseFloat(amount))}
          </p>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {quickAmounts.map((quickAmount) => (
            <Button
              key={quickAmount}
              variant="outline"
              size="sm"
              onClick={() => setAmount(quickAmount.toString())}
              className="text-xs"
            >
              {formatCurrency(quickAmount)}
            </Button>
          ))}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              variant="outline"
              size="lg"
              onClick={() => handleNumberClick(num.toString())}
              className="h-14 text-lg font-semibold"
            >
              {num}
            </Button>
          ))}
          <Button
            variant="outline"
            size="lg"
            onClick={handleClear}
            className="h-14"
          >
            C
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleNumberClick('0')}
            className="h-14 text-lg font-semibold"
          >
            0
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleBackspace}
            className="h-14"
          >
            <Delete className="h-5 w-5" />
          </Button>
        </div>

        {/* Category and Card Selection */}
        <div className="grid grid-cols-2 gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded-lg glass-subtle text-sm"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
          <select
            value={cardId}
            onChange={(e) => setCardId(e.target.value)}
            className="px-3 py-2 rounded-lg glass-subtle text-sm"
          >
            {cards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.name}
              </option>
            ))}
          </select>
        </div>

        {/* Merchant Input or Submit */}
        {showMerchantInput ? (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="가맹점명 입력"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="w-full px-3 py-2 rounded-lg glass-subtle text-sm"
              autoFocus
            />
            <Button
              onClick={handleSubmit}
              disabled={!merchant || parseFloat(amount) === 0}
              className="w-full"
            >
              <Check className="h-4 w-4 mr-2" />
              추가하기
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={parseFloat(amount) === 0}
            className="w-full"
            size="lg"
          >
            다음
          </Button>
        )}
      </CardContent>
    </Card>
  )
}