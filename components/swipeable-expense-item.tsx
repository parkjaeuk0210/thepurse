'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { CATEGORIES, type Card as CardType, type Expense } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Trash2, Edit2 } from 'lucide-react'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import { haptics } from '@/lib/haptics'

interface SwipeableExpenseItemProps {
  expense: Expense
  card: CardType | undefined
  onDelete: (id: string) => void
  onEdit?: (id: string) => void
}

export function SwipeableExpenseItem({ expense, card, onDelete, onEdit }: SwipeableExpenseItemProps) {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteButton, setShowDeleteButton] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const longPressTimer = useRef<NodeJS.Timeout>()
  
  const category = CATEGORIES.find(cat => cat.id === expense.category)
  
  const handleDelete = () => {
    haptics.heavy()
    setIsDeleting(true)
    setTimeout(() => {
      onDelete(expense.id)
    }, 300)
  }

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => {
      haptics.light()
      setSwipeOffset(-100)
    },
    onSwipeRight: () => {
      haptics.light()
      setSwipeOffset(0)
    },
  })

  const handleTouchMove = (e: React.TouchEvent) => {
    // Cancel long press if user starts swiping
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
    
    if (containerRef.current) {
      const touch = e.touches[0]
      const startX = containerRef.current.getBoundingClientRect().left
      const currentX = touch.clientX - startX
      const offset = Math.max(-100, Math.min(0, currentX))
      setSwipeOffset(offset)
    }
    swipeHandlers.onTouchMove(e)
  }

  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      haptics.medium()
      setShowDeleteButton(true)
    }, 500) // 0.5초 길게 누르기
  }

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl ${isDeleting ? 'animate-fade-out' : ''}`}
    >
      {/* Action buttons background */}
      <div className="absolute inset-0 flex items-center justify-end gap-2 px-4 bg-gradient-to-l from-destructive to-destructive/80">
        {onEdit && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(expense.id)}
            className="h-10 w-10 text-white hover:bg-white/20"
          >
            <Edit2 className="h-5 w-5" />
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          onClick={handleDelete}
          className="h-10 w-10 text-white hover:bg-white/20"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Swipeable content */}
      <div
        ref={containerRef}
        className="relative bg-background glass-subtle transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${swipeOffset}px)` }}
        {...swipeHandlers}
        onTouchMove={handleTouchMove}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${category?.color || 'bg-gray-500'}`}>
              <span className="text-lg">{category?.icon}</span>
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
                  {expense.installment.currentMonth}/{expense.installment.totalMonths}
                </p>
              )}
              {expense.subscription && (
                <p className="text-xs text-muted-foreground">
                  {expense.subscription.frequency === 'monthly' ? '월간' : '연간'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete button overlay - shown on long press */}
      {showDeleteButton && (
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center animate-fade-in z-10"
          onClick={() => setShowDeleteButton(false)}
        >
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleDelete()
            }}
            className="apple-shadow"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            삭제
          </Button>
        </div>
      )}
    </div>
  )
}