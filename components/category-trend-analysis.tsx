'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { type Expense, CATEGORIES } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, ChartLine } from 'lucide-react'
import { haptics } from '@/lib/haptics'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface CategoryTrendAnalysisProps {
  expenses: Expense[]
  className?: string
}

export function CategoryTrendAnalysis({ expenses, className }: CategoryTrendAnalysisProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['food', 'shopping', 'transport'])
  const [period, setPeriod] = useState<'3months' | '6months' | '12months'>('6months')
  
  const trendData = useMemo(() => {
    const now = new Date()
    const monthsToShow = period === '3months' ? 3 : period === '6months' ? 6 : 12
    const months = []
    
    // Generate month labels
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        label: date.toLocaleDateString('ko-KR', { month: 'short' }),
        fullLabel: date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' }),
      })
    }
    
    // Calculate data for each month and category
    const data = months.map(({ year, month, label, fullLabel }) => {
      const monthData: any = {
        month: label,
        fullMonth: fullLabel,
      }
      
      selectedCategories.forEach(categoryId => {
        const categoryExpenses = expenses.filter(expense => {
          const expenseDate = new Date(expense.date)
          return expenseDate.getFullYear() === year && 
                 expenseDate.getMonth() === month && 
                 expense.category === categoryId
        })
        
        monthData[categoryId] = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      })
      
      return monthData
    })
    
    return data
  }, [expenses, selectedCategories, period])
  
  const categoryStats = useMemo(() => {
    return CATEGORIES.map(category => {
      const categoryExpenses = expenses.filter(e => e.category === category.id)
      const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0)
      
      // Calculate trend
      const now = new Date()
      const currentMonth = categoryExpenses.filter(e => {
        const date = new Date(e.date)
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      }).reduce((sum, e) => sum + e.amount, 0)
      
      const lastMonth = categoryExpenses.filter(e => {
        const date = new Date(e.date)
        const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
        const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
        return date.getMonth() === prevMonth && date.getFullYear() === prevYear
      }).reduce((sum, e) => sum + e.amount, 0)
      
      const trend = lastMonth > 0 ? ((currentMonth - lastMonth) / lastMonth) * 100 : 0
      
      return {
        ...category,
        total,
        currentMonth,
        trend,
        isSelected: selectedCategories.includes(category.id),
      }
    }).sort((a, b) => b.total - a.total)
  }, [expenses, selectedCategories])
  
  const toggleCategory = (categoryId: string) => {
    haptics.light()
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      }
      if (prev.length >= 5) {
        alert('최대 5개 카테고리만 선택할 수 있습니다')
        return prev
      }
      return [...prev, categoryId]
    })
  }
  
  const changePeriod = (newPeriod: '3months' | '6months' | '12months') => {
    haptics.light()
    setPeriod(newPeriod)
  }
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass rounded-lg p-3 apple-shadow">
          <p className="text-sm font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => {
            const category = CATEGORIES.find(c => c.id === entry.dataKey)
            return (
              <div key={index} className="flex items-center justify-between gap-3">
                <span className="text-sm flex items-center gap-1">
                  <span>{category?.icon}</span>
                  {category?.name}
                </span>
                <span className="text-sm font-semibold">
                  {formatCurrency(entry.value)}
                </span>
              </div>
            )
          })}
        </div>
      )
    }
    return null
  }
  
  // Generate colors for selected categories
  const getLineColor = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId)
    const colorClass = category?.color || ''
    
    // Extract color from Tailwind class
    const colorMap: Record<string, string> = {
      'bg-orange-500': '#f97316',
      'bg-blue-500': '#3b82f6',
      'bg-pink-500': '#ec4899',
      'bg-purple-500': '#a855f7',
      'bg-green-500': '#22c55e',
      'bg-indigo-500': '#6366f1',
      'bg-yellow-500': '#eab308',
      'bg-emerald-500': '#10b981',
      'bg-gray-500': '#6b7280',
    }
    
    return colorMap[colorClass.split(' ')[0]] || '#6b7280'
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ChartLine className="h-5 w-5" />
            카테고리별 지출 트렌드
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={period === '3months' ? 'default' : 'outline'}
              size="sm"
              onClick={() => changePeriod('3months')}
            >
              3개월
            </Button>
            <Button
              variant={period === '6months' ? 'default' : 'outline'}
              size="sm"
              onClick={() => changePeriod('6months')}
            >
              6개월
            </Button>
            <Button
              variant={period === '12months' ? 'default' : 'outline'}
              size="sm"
              onClick={() => changePeriod('12months')}
            >
              12개월
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Selection */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">카테고리 선택 (최대 5개)</p>
          <div className="flex flex-wrap gap-2">
            {categoryStats.map(category => (
              <Button
                key={category.id}
                variant={category.isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleCategory(category.id)}
                className="gap-1"
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
                {category.trend !== 0 && (
                  <span className={`text-xs ${category.trend > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {category.trend > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Trend Chart */}
        {selectedCategories.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  formatter={(value) => {
                    const category = CATEGORIES.find(c => c.id === value)
                    return `${category?.icon} ${category?.name}`
                  }}
                />
                {selectedCategories.map(categoryId => (
                  <Line
                    key={categoryId}
                    type="monotone"
                    dataKey={categoryId}
                    stroke={getLineColor(categoryId)}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>카테고리를 선택하여 트렌드를 확인하세요</p>
          </div>
        )}
        
        {/* Category Summary */}
        {selectedCategories.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">선택한 카테고리 요약</p>
            <div className="grid gap-2">
              {categoryStats
                .filter(c => selectedCategories.includes(c.id))
                .map(category => (
                  <div key={category.id} className="flex items-center justify-between glass-subtle rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.color}`}>
                        <span className="text-sm">{category.icon}</span>
                      </div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(category.currentMonth)}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {category.trend > 0 ? (
                          <>
                            <TrendingUp className="h-3 w-3 text-red-500" />
                            <span className="text-red-500">+{category.trend.toFixed(1)}%</span>
                          </>
                        ) : category.trend < 0 ? (
                          <>
                            <TrendingDown className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">{category.trend.toFixed(1)}%</span>
                          </>
                        ) : (
                          <>
                            <Minus className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-500">0%</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}