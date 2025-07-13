'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type Expense } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

interface MonthlyTrendChartProps {
  expenses: Expense[]
  className?: string
}

export function MonthlyTrendChart({ expenses, className }: MonthlyTrendChartProps) {
  const monthlyData = useMemo(() => {
    // Get last 6 months
    const now = new Date()
    const months = []
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        label: date.toLocaleDateString('ko-KR', { month: 'short' }),
        fullLabel: date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' }),
      })
    }

    // Calculate monthly totals
    const data = months.map(({ year, month, label, fullLabel }) => {
      const monthlyExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date)
        return expenseDate.getFullYear() === year && expenseDate.getMonth() === month
      })

      const total = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      
      return {
        month: label,
        fullMonth: fullLabel,
        amount: total,
        count: monthlyExpenses.length,
      }
    })

    return data
  }, [expenses])

  // Calculate trend
  const trend = useMemo(() => {
    if (monthlyData.length < 2) return { percentage: 0, direction: 'neutral' }
    
    const currentMonth = monthlyData[monthlyData.length - 1].amount
    const previousMonth = monthlyData[monthlyData.length - 2].amount
    
    if (previousMonth === 0) return { percentage: 0, direction: 'neutral' }
    
    const percentage = ((currentMonth - previousMonth) / previousMonth) * 100
    const direction = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral'
    
    return { percentage: Math.abs(percentage), direction }
  }, [monthlyData])

  const maxAmount = Math.max(...monthlyData.map(d => d.amount))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload
      return (
        <div className="glass rounded-lg p-3 apple-shadow">
          <p className="text-sm font-medium">{data.fullMonth}</p>
          <p className="text-lg font-semibold">{formatCurrency(data.amount)}</p>
          <p className="text-xs text-muted-foreground">{data.count}건의 지출</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">월별 지출 추이</CardTitle>
          <div className="flex items-center gap-2">
            {trend.direction === 'up' && (
              <>
                <TrendingUp className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-500">
                  +{trend.percentage.toFixed(1)}%
                </span>
              </>
            )}
            {trend.direction === 'down' && (
              <>
                <TrendingDown className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-500">
                  -{trend.percentage.toFixed(1)}%
                </span>
              </>
            )}
            {trend.direction === 'neutral' && (
              <>
                <Minus className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">0%</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                domain={[0, maxAmount * 1.1]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorAmount)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Summary */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">평균 지출</p>
            <p className="text-sm font-semibold">
              {formatCurrency(
                monthlyData.reduce((sum, d) => sum + d.amount, 0) / monthlyData.length
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">최고 지출</p>
            <p className="text-sm font-semibold">
              {formatCurrency(maxAmount)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">이번 달</p>
            <p className="text-sm font-semibold">
              {formatCurrency(monthlyData[monthlyData.length - 1]?.amount || 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}