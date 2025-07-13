'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SwipeableExpenseItem } from '@/components/swipeable-expense-item'
import { AdvancedFilter, type FilterOptions } from '@/components/advanced-filter'
import { CATEGORIES, type Card as CardType, type Expense } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Search, Filter, Trash2, X } from 'lucide-react'
import { haptics } from '@/lib/haptics'

interface ExpenseListProps {
  expenses: Expense[]
  cards: CardType[]
  onDeleteExpense: (id: string) => void
}

export function ExpenseList({ expenses, cards, onDeleteExpense }: ExpenseListProps) {
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    dateRange: { start: '', end: '' },
    amountRange: { min: '', max: '' },
    categories: [],
    cards: [],
    sortBy: 'date',
    sortOrder: 'desc',
  })
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile device
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = expenses.filter((expense) => {
      // Search term filter
      const matchesSearch = !filters.searchTerm || 
        expense.merchant.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        expense.description?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      
      // Date range filter
      const expenseDate = new Date(expense.date)
      const matchesDateRange = 
        (!filters.dateRange.start || expenseDate >= new Date(filters.dateRange.start)) &&
        (!filters.dateRange.end || expenseDate <= new Date(filters.dateRange.end))
      
      // Amount range filter
      const matchesAmountRange = 
        (!filters.amountRange.min || expense.amount >= parseFloat(filters.amountRange.min)) &&
        (!filters.amountRange.max || expense.amount <= parseFloat(filters.amountRange.max))
      
      // Category filter
      const matchesCategory = filters.categories.length === 0 || 
        filters.categories.includes(expense.category)
      
      // Card filter
      const matchesCard = filters.cards.length === 0 || 
        filters.cards.includes(expense.cardId)
      
      return matchesSearch && matchesDateRange && matchesAmountRange && 
             matchesCategory && matchesCard
    })
    
    // Sort
    filtered.sort((a, b) => {
      let compareValue = 0
      
      switch (filters.sortBy) {
        case 'date':
          compareValue = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'amount':
          compareValue = a.amount - b.amount
          break
        case 'merchant':
          compareValue = a.merchant.localeCompare(b.merchant)
          break
      }
      
      return filters.sortOrder === 'asc' ? compareValue : -compareValue
    })
    
    return filtered
  }, [expenses, filters])

  const getCard = (cardId: string) => cards.find(card => card.id === cardId)
  const getCategory = (categoryId: string) => CATEGORIES.find(cat => cat.id === categoryId)
  
  const activeFiltersCount = 
    (filters.searchTerm ? 1 : 0) +
    (filters.dateRange.start || filters.dateRange.end ? 1 : 0) +
    (filters.amountRange.min || filters.amountRange.max ? 1 : 0) +
    filters.categories.length +
    filters.cards.length +
    (filters.sortBy !== 'date' || filters.sortOrder !== 'desc' ? 1 : 0)

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>지출 내역</CardTitle>
            <span className="text-sm text-muted-foreground">
              총 {filteredAndSortedExpenses.length}건
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="빠른 검색..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  className="pl-10"
                />
              </div>
              <Button
                variant={showAdvancedFilter ? 'default' : 'outline'}
                onClick={() => {
                  haptics.light()
                  setShowAdvancedFilter(!showAdvancedFilter)
                }}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                필터
                {activeFiltersCount > 0 && (
                  <span className="bg-background text-foreground rounded-full px-1.5 py-0.5 text-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
            
            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.dateRange.start && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-lg text-sm">
                    <span>시작일: {filters.dateRange.start}</span>
                    <button
                      onClick={() => setFilters({ 
                        ...filters, 
                        dateRange: { ...filters.dateRange, start: '' } 
                      })}
                      className="hover:bg-primary/20 rounded p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {filters.categories.map(categoryId => {
                  const category = getCategory(categoryId)
                  return category && (
                    <div key={categoryId} className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-lg text-sm">
                      <span>{category.icon} {category.name}</span>
                      <button
                        onClick={() => setFilters({ 
                          ...filters, 
                          categories: filters.categories.filter(id => id !== categoryId) 
                        })}
                        className="hover:bg-primary/20 rounded p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {filteredAndSortedExpenses.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                검색 조건에 맞는 지출 내역이 없습니다.
              </p>
            ) : (
              filteredAndSortedExpenses.map((expense) => {
                const card = getCard(expense.cardId)
                
                return isMobile ? (
                  <SwipeableExpenseItem
                    key={expense.id}
                    expense={expense}
                    card={card}
                    onDelete={onDeleteExpense}
                  />
                ) : (
                  <div
                    key={expense.id}
                    className="group flex items-center justify-between p-4 rounded-2xl glass-subtle hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${getCategory(expense.category)?.color || 'bg-gray-500'}`}>
                        <span className="text-lg">{getCategory(expense.category)?.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{expense.merchant}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="truncate">{card?.name}</span>
                          <span className="flex-shrink-0">•</span>
                          <span className="flex-shrink-0">{formatDate(expense.date)}</span>
                          {expense.description && (
                            <>
                              <span className="flex-shrink-0">•</span>
                              <span className="truncate">{expense.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <span className="font-semibold text-lg">
                          {formatCurrency(expense.amount)}
                        </span>
                        {expense.installment && (
                          <p className="text-xs text-muted-foreground">
                            {expense.installment.currentMonth}/{expense.installment.totalMonths}개월
                          </p>
                        )}
                        {expense.subscription && (
                          <p className="text-xs text-muted-foreground">
                            {expense.subscription.frequency === 'monthly' ? '월간' : '연간'} 구독
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`"${expense.merchant}" 지출을 삭제하시겠습니까?`)) {
                            onDeleteExpense(expense.id)
                          }
                        }}
                        className="h-9 w-9 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity hover:bg-destructive/10"
                        title="삭제"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Advanced Filter Panel */}
      <AdvancedFilter
        cards={cards}
        filters={filters}
        onFiltersChange={setFilters}
        isOpen={showAdvancedFilter}
        onClose={() => setShowAdvancedFilter(false)}
      />
    </>
  )
}