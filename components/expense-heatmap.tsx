'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type Expense } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Calendar, TrendingUp } from 'lucide-react'

interface ExpenseHeatmapProps {
  expenses: Expense[]
  className?: string
}

export function ExpenseHeatmap({ expenses, className }: ExpenseHeatmapProps) {
  const heatmapData = useMemo(() => {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 35) // Show last 5 weeks
    
    // Group expenses by date
    const expensesByDate = expenses.reduce((acc, expense) => {
      const date = new Date(expense.date)
      const dateKey = date.toISOString().split('T')[0]
      
      if (!acc[dateKey]) {
        acc[dateKey] = { total: 0, count: 0 }
      }
      
      acc[dateKey].total += expense.amount
      acc[dateKey].count += 1
      
      return acc
    }, {} as Record<string, { total: number; count: number }>)
    
    // Generate calendar data
    const calendarData = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= today) {
      const dateKey = currentDate.toISOString().split('T')[0]
      const dayData = expensesByDate[dateKey] || { total: 0, count: 0 }
      
      calendarData.push({
        date: new Date(currentDate),
        dateKey,
        total: dayData.total,
        count: dayData.count,
        dayOfWeek: currentDate.getDay(),
        weekOfMonth: Math.floor((currentDate.getDate() - 1) / 7),
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return calendarData
  }, [expenses])

  // Calculate intensity levels
  const maxAmount = Math.max(...heatmapData.map(d => d.total))
  const getIntensity = (amount: number) => {
    if (amount === 0) return 0
    const percentage = amount / maxAmount
    if (percentage <= 0.25) return 1
    if (percentage <= 0.5) return 2
    if (percentage <= 0.75) return 3
    return 4
  }

  // Group data by weeks
  const weeks = useMemo(() => {
    const weekMap = new Map<number, typeof heatmapData>()
    
    heatmapData.forEach(day => {
      const weekStart = new Date(day.date)
      weekStart.setDate(day.date.getDate() - day.date.getDay())
      const weekKey = weekStart.getTime()
      
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, [])
      }
      
      weekMap.get(weekKey)?.push(day)
    })
    
    return Array.from(weekMap.values())
  }, [heatmapData])

  const dayLabels = ['일', '월', '화', '수', '목', '금', '토']
  
  const monthLabels = useMemo(() => {
    const months = new Set<string>()
    heatmapData.forEach(day => {
      months.add(day.date.toLocaleDateString('ko-KR', { month: 'short' }))
    })
    return Array.from(months)
  }, [heatmapData])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          일별 지출 히트맵
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Month labels */}
          <div className="flex gap-2 text-xs text-muted-foreground">
            {monthLabels.map((month, index) => (
              <span key={index} className="flex-1 text-center">
                {month}
              </span>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 pr-2">
              {dayLabels.map((day, index) => (
                <div
                  key={index}
                  className="h-4 flex items-center justify-end text-xs text-muted-foreground"
                  style={{ visibility: index % 2 === 0 ? 'visible' : 'hidden' }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="flex gap-1 flex-1 overflow-x-auto">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {[0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => {
                    const day = week.find(d => d.dayOfWeek === dayOfWeek)
                    
                    if (!day) {
                      return <div key={dayOfWeek} className="w-4 h-4" />
                    }
                    
                    const intensity = getIntensity(day.total)
                    const isToday = day.dateKey === new Date().toISOString().split('T')[0]
                    
                    return (
                      <div
                        key={dayOfWeek}
                        className={`
                          w-4 h-4 rounded-sm transition-all cursor-pointer
                          ${intensity === 0 && 'bg-muted hover:bg-muted/80'}
                          ${intensity === 1 && 'bg-blue-200 dark:bg-blue-900/50 hover:bg-blue-300'}
                          ${intensity === 2 && 'bg-blue-300 dark:bg-blue-800/50 hover:bg-blue-400'}
                          ${intensity === 3 && 'bg-blue-400 dark:bg-blue-700/50 hover:bg-blue-500'}
                          ${intensity === 4 && 'bg-blue-500 dark:bg-blue-600/50 hover:bg-blue-600'}
                          ${isToday && 'ring-2 ring-primary ring-offset-1'}
                        `}
                        title={`${day.date.toLocaleDateString('ko-KR')}\n${formatCurrency(day.total)}\n${day.count}건`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">적음</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-muted" />
                <div className="w-3 h-3 rounded-sm bg-blue-200 dark:bg-blue-900/50" />
                <div className="w-3 h-3 rounded-sm bg-blue-300 dark:bg-blue-800/50" />
                <div className="w-3 h-3 rounded-sm bg-blue-400 dark:bg-blue-700/50" />
                <div className="w-3 h-3 rounded-sm bg-blue-500 dark:bg-blue-600/50" />
              </div>
              <span className="text-xs text-muted-foreground">많음</span>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-muted-foreground">최고 일일 지출</p>
              <p className="text-sm font-semibold">{formatCurrency(maxAmount)}</p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">평균 일일 지출</p>
              <p className="text-sm font-semibold">
                {formatCurrency(
                  heatmapData.reduce((sum, d) => sum + d.total, 0) / 
                  heatmapData.filter(d => d.total > 0).length || 0
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">지출한 날</p>
              <p className="text-sm font-semibold">
                {heatmapData.filter(d => d.total > 0).length}일
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">지출 없는 날</p>
              <p className="text-sm font-semibold">
                {heatmapData.filter(d => d.total === 0).length}일
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}