'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Smartphone, Monitor, Apple, Chrome, Globe, X } from 'lucide-react'

export function InstallationGuide() {
  const [showGuide, setShowGuide] = useState(false)
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'desktop'>('ios')

  if (!showGuide) {
    return (
      <Button
        onClick={() => setShowGuide(true)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Smartphone className="h-4 w-4" />
        설치 방법
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowGuide(false)}
      />
      <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>앱 설치 가이드</CardTitle>
              <CardDescription>기기별 설치 방법을 확인하세요</CardDescription>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'ios' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('ios')}
              className="gap-2"
            >
              <Apple className="h-4 w-4" />
              iPhone
            </Button>
            <Button
              variant={activeTab === 'android' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('android')}
              className="gap-2"
            >
              <Chrome className="h-4 w-4" />
              Android
            </Button>
            <Button
              variant={activeTab === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('desktop')}
              className="gap-2"
            >
              <Monitor className="h-4 w-4" />
              PC
            </Button>
          </div>

          {/* iOS Instructions */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  ⚠️ Safari 브라우저에서만 설치 가능합니다
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Safari로 앱 열기</p>
                    <p className="text-sm text-muted-foreground">Chrome이나 다른 브라우저는 지원하지 않습니다</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">공유 버튼 탭하기</p>
                    <p className="text-sm text-muted-foreground">화면 하단 중앙의 □↑ 아이콘을 탭하세요</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">"홈 화면에 추가" 선택</p>
                    <p className="text-sm text-muted-foreground">스크롤해서 찾아야 할 수도 있습니다</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                    4
                  </div>
                  <div>
                    <p className="font-medium">"추가" 탭하기</p>
                    <p className="text-sm text-muted-foreground">홈 화면에 앱 아이콘이 추가됩니다</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Android Instructions */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-xl">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  ✓ Chrome, Samsung Internet 등에서 설치 가능합니다
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Chrome으로 앱 열기</p>
                    <p className="text-sm text-muted-foreground">주소창에 URL을 입력하세요</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">메뉴 버튼(⋮) 탭하기</p>
                    <p className="text-sm text-muted-foreground">주소창 오른쪽에 있습니다</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">"앱 설치" 선택</p>
                    <p className="text-sm text-muted-foreground">또는 "홈 화면에 추가"를 선택하세요</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                    4
                  </div>
                  <div>
                    <p className="font-medium">"설치" 탭하기</p>
                    <p className="text-sm text-muted-foreground">자동으로 설치 배너가 나타날 수도 있습니다</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Instructions */}
          {activeTab === 'desktop' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  💻 Chrome, Edge, Opera 등에서 설치 가능합니다
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Chrome이나 Edge로 앱 열기</p>
                    <p className="text-sm text-muted-foreground">주소창에 URL을 입력하세요</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">주소창의 설치 아이콘(⊕) 클릭</p>
                    <p className="text-sm text-muted-foreground">주소창 오른쪽 끝에 있습니다</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">"설치" 버튼 클릭</p>
                    <p className="text-sm text-muted-foreground">바탕화면과 시작 메뉴에 추가됩니다</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Troubleshooting */}
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
            <p className="font-medium text-amber-900 dark:text-amber-100 mb-2">
              설치 버튼이 보이지 않나요?
            </p>
            <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
              <li>• HTTPS 연결인지 확인하세요</li>
              <li>• 최신 버전의 브라우저를 사용하세요</li>
              <li>• 시크릿/프라이빗 모드에서는 설치할 수 없습니다</li>
              <li>• 이미 설치된 경우 설치 옵션이 나타나지 않습니다</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}