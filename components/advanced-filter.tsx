'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CATEGORIES, type Card as CardType } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Filter, X, Calendar, DollarSign, Tag, CreditCard } from 'lucide-react'
import { haptics } from '@/lib/haptics'

export interface FilterOptions {
  searchTerm: string
  dateRange: {
    start: string
    end: string
  }
  amountRange: {
    min: string
    max: string
  }
  categories: string[]
  cards: string[]
  sortBy: 'date' | 'amount' | 'merchant'
  sortOrder: 'asc' | 'desc'
}

interface AdvancedFilterProps {
  cards: CardType[]
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  isOpen: boolean
  onClose: () => void
}

export function AdvancedFilter({ cards, filters, onFiltersChange, isOpen, onClose }: AdvancedFilterProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters)
  
  const handleApply = () => {
    haptics.medium()
    onFiltersChange(localFilters)
    onClose()
  }
  
  const handleReset = () => {
    haptics.light()
    const resetFilters: FilterOptions = {
      searchTerm: '',
      dateRange: { start: '', end: '' },
      amountRange: { min: '', max: '' },
      categories: [],
      cards: [],
      sortBy: 'date',
      sortOrder: 'desc',
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
  }
  
  const toggleCategory = (categoryId: string) => {
    haptics.light()
    setLocalFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }))
  }
  
  const toggleCard = (cardId: string) => {
    haptics.light()
    setLocalFilters(prev => ({
      ...prev,
      cards: prev.cards.includes(cardId)
        ? prev.cards.filter(id => id !== cardId)
        : [...prev.cards, cardId]
    }))
  }
  
  const activeFiltersCount = 
    (localFilters.searchTerm ? 1 : 0) +
    (localFilters.dateRange.start || localFilters.dateRange.end ? 1 : 0) +
    (localFilters.amountRange.min || localFilters.amountRange.max ? 1 : 0) +
    localFilters.categories.length +
    localFilters.cards.length
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />
      <Card className="absolute inset-x-4 top-20 bottom-20 lg:relative lg:inset-auto overflow-y-auto lg:overflow-visible animate-slide-up lg:animate-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              고급 필터
              {activeFiltersCount > 0 && (
                <span className="text-sm bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                  {activeFiltersCount}
                </span>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              검색어
            </Label>
            <Input
              placeholder="가맹점명 또는 메모 검색"
              value={localFilters.searchTerm}
              onChange={(e) => setLocalFilters({ ...localFilters, searchTerm: e.target.value })}
            />
          </div>
          
          {/* Date Range */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              날짜 범위
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={localFilters.dateRange.start}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  dateRange: { ...localFilters.dateRange, start: e.target.value }
                })}
              />
              <Input
                type="date"
                value={localFilters.dateRange.end}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  dateRange: { ...localFilters.dateRange, end: e.target.value }
                })}
                min={localFilters.dateRange.start}
              />
            </div>
          </div>
          
          {/* Amount Range */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              금액 범위
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="최소 금액"
                value={localFilters.amountRange.min}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  amountRange: { ...localFilters.amountRange, min: e.target.value }
                })}
              />
              <Input
                type="number"
                placeholder="최대 금액"
                value={localFilters.amountRange.max}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  amountRange: { ...localFilters.amountRange, max: e.target.value }
                })}
                min={localFilters.amountRange.min}
              />
            </div>
          </div>
          
          {/* Categories */}
          <div className="space-y-2">
            <Label>카테고리</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(category => (
                <Button
                  key={category.id}
                  variant={localFilters.categories.includes(category.id) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleCategory(category.id)}
                  className="gap-1"
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {/* Cards */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              카드
            </Label>
            <div className="flex flex-wrap gap-2">
              {cards.map(card => (
                <Button
                  key={card.id}
                  variant={localFilters.cards.includes(card.id) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleCard(card.id)}
                >
                  {card.name}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Sort Options */}
          <div className="space-y-2">
            <Label>정렬</Label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={localFilters.sortBy}
                onChange={(e) => setLocalFilters({ 
                  ...localFilters, 
                  sortBy: e.target.value as 'date' | 'amount' | 'merchant' 
                })}
                className="px-3 py-2 rounded-lg glass-subtle text-sm"
              >
                <option value="date">날짜</option>
                <option value="amount">금액</option>
                <option value="merchant">가맹점</option>
              </select>
              <select
                value={localFilters.sortOrder}
                onChange={(e) => setLocalFilters({ 
                  ...localFilters, 
                  sortOrder: e.target.value as 'asc' | 'desc' 
                })}
                className="px-3 py-2 rounded-lg glass-subtle text-sm"
              >
                <option value="desc">내림차순</option>
                <option value="asc">오름차순</option>
              </select>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1"
            >
              초기화
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1"
            >
              적용하기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}