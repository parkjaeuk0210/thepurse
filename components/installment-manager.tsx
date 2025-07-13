'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type InstallmentPayment, type Card as CardType, CATEGORIES } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CreditCard, Calendar, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { haptics } from '@/lib/haptics'

interface InstallmentManagerProps {
  installments: InstallmentPayment[]
  cards: CardType[]
  onDeleteInstallment: (id: string) => void
  onToggleInstallment: (id: string, isActive: boolean) => void
}

export function InstallmentManager({
  installments,
  cards,
  onDeleteInstallment,
  onToggleInstallment,
}: InstallmentManagerProps) {
  const activeInstallments = installments.filter(i => i.isActive)
  const inactiveInstallments = installments.filter(i => !i.isActive)

  const monthlyTotal = useMemo(() => {
    return activeInstallments.reduce((sum, installment) => sum + installment.monthlyAmount, 0)
  }, [activeInstallments])

  const remainingTotal = useMemo(() => {
    return activeInstallments.reduce((sum, installment) => 
      sum + (installment.monthlyAmount * installment.remainingMonths), 0
    )
  }, [activeInstallments])

  const getCard = (cardId: string) => cards.find(c => c.id === cardId)
  const getCategory = (categoryId: string) => CATEGORIES.find(c => c.id === categoryId)

  const getNextPaymentDate = (installment: InstallmentPayment) => {
    const today = new Date()
    const startDate = new Date(installment.startDate)
    const monthsPassed = installment.totalMonths - installment.remainingMonths
    
    const nextPayment = new Date(startDate)
    nextPayment.setMonth(startDate.getMonth() + monthsPassed + 1)
    
    return nextPayment
  }

  const InstallmentItem = ({ installment }: { installment: InstallmentPayment }) => {
    const card = getCard(installment.cardId)
    const category = getCategory(installment.category)
    const nextPayment = getNextPaymentDate(installment)
    const progress = ((installment.totalMonths - installment.remainingMonths) / installment.totalMonths) * 100

    return (
      <div className="glass-subtle rounded-xl p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">{category?.icon}</span>
              <h4 className="font-medium">{installment.merchant}</h4>
            </div>
            {installment.description && (
              <p className="text-sm text-muted-foreground mt-1">{installment.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                haptics.light()
                onToggleInstallment(installment.id, !installment.isActive)
              }}
            >
              {installment.isActive ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                haptics.heavy()
                if (confirm('이 할부를 삭제하시겠습니까?')) {
                  onDeleteInstallment(installment.id)
                }
              }}
              className="text-destructive"
            >
              삭제
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">월 납부액</p>
            <p className="font-semibold">{formatCurrency(installment.monthlyAmount)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">남은 금액</p>
            <p className="font-semibold">
              {formatCurrency(installment.monthlyAmount * installment.remainingMonths)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {installment.totalMonths - installment.remainingMonths}/{installment.totalMonths}개월
            </span>
            <span className="text-muted-foreground">
              {installment.remainingMonths}개월 남음
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CreditCard className="h-3 w-3" />
            <span>{card?.name}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>다음 결제: {formatDate(nextPayment)}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              월 할부 총액
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(monthlyTotal)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              남은 할부 총액
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(remainingTotal)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              진행중인 할부
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeInstallments.length}건</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Installments */}
      <Card>
        <CardHeader>
          <CardTitle>진행중인 할부</CardTitle>
          <CardDescription>매월 자동으로 청구되는 할부 내역</CardDescription>
        </CardHeader>
        <CardContent>
          {activeInstallments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>진행중인 할부가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeInstallments.map(installment => (
                <InstallmentItem key={installment.id} installment={installment} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inactive Installments */}
      {inactiveInstallments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>일시정지된 할부</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inactiveInstallments.map(installment => (
                <InstallmentItem key={installment.id} installment={installment} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Payments */}
      {activeInstallments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>이번 달 예정 할부</CardTitle>
            <CardDescription>30일 이내 결제 예정인 할부</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeInstallments
                .map(installment => ({
                  ...installment,
                  nextPayment: getNextPaymentDate(installment),
                }))
                .filter(installment => {
                  const daysUntil = Math.floor(
                    (installment.nextPayment.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  )
                  return daysUntil >= 0 && daysUntil <= 30
                })
                .sort((a, b) => a.nextPayment.getTime() - b.nextPayment.getTime())
                .map(installment => {
                  const card = getCard(installment.cardId)
                  const daysUntil = Math.floor(
                    (installment.nextPayment.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  )
                  
                  return (
                    <div key={installment.id} className="flex items-center justify-between p-3 glass-subtle rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${daysUntil <= 7 ? 'bg-red-500' : 'bg-blue-500'}`} />
                        <div>
                          <p className="font-medium">{installment.merchant}</p>
                          <p className="text-sm text-muted-foreground">{card?.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(installment.monthlyAmount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {daysUntil === 0 ? '오늘' : `${daysUntil}일 후`}
                        </p>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}