'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type Expense, type Card as CardType } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { CreditCard } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

interface CardUsageChartProps {
  expenses: Expense[]
  cards: CardType[]
  className?: string
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
]

export function CardUsageChart({ expenses, cards, className }: CardUsageChartProps) {
  const cardData = useMemo(() => {
    // Calculate total spending per card
    const cardTotals = cards.map(card => {
      const cardExpenses = expenses.filter(expense => expense.cardId === card.id)
      const total = cardExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      
      return {
        id: card.id,
        name: card.name,
        value: total,
        count: cardExpenses.length,
        color: card.color || COLORS[cards.indexOf(card) % COLORS.length],
      }
    }).filter(card => card.value > 0) // Only show cards with expenses

    // Sort by value descending
    return cardTotals.sort((a, b) => b.value - a.value)
  }, [expenses, cards])

  const totalAmount = cardData.reduce((sum, card) => sum + card.value, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload
      const percentage = ((data.value / totalAmount) * 100).toFixed(1)
      
      return (
        <div className="glass rounded-lg p-3 apple-shadow">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-lg font-semibold">{formatCurrency(data.value)}</p>
          <p className="text-xs text-muted-foreground">{percentage}% · {data.count}건</p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    if (percent < 0.05) return null // Don't show label for small slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  const renderCustomizedLegend = (props: any) => {
    const { payload } = props
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
        {payload.map((entry: any, index: number) => {
          const percentage = ((entry.payload.value / totalAmount) * 100).toFixed(1)
          
          return (
            <div
              key={`item-${index}`}
              className="flex items-center justify-between glass-subtle rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium">{entry.value}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatCurrency(entry.payload.value)}</p>
                <p className="text-xs text-muted-foreground">{percentage}%</p>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (cardData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            카드별 사용 비율
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <CreditCard className="h-12 w-12 mb-2" />
            <p className="text-sm">아직 지출 내역이 없습니다</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            카드별 사용 비율
          </CardTitle>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">총 지출</p>
            <p className="text-lg font-semibold">{formatCurrency(totalAmount)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={cardData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {cardData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Custom Legend */}
        {renderCustomizedLegend({ payload: cardData.map((item, index) => ({
          value: item.name,
          type: 'square',
          id: item.id,
          color: item.color,
          payload: item,
        })) })}

        {/* Top Card Summary */}
        {cardData.length > 0 && (
          <div className="mt-6 p-4 glass-subtle rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">가장 많이 사용한 카드</p>
                <p className="text-base font-semibold">{cardData[0].name}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{formatCurrency(cardData[0].value)}</p>
                <p className="text-xs text-muted-foreground">
                  {((cardData[0].value / totalAmount) * 100).toFixed(1)}% 사용
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}