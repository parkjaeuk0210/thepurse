'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, X, Smartphone, Home } from 'lucide-react'
import { haptics } from '@/lib/haptics'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check if should show instructions based on user agent
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    
    if (isIOS && isSafari && !isInstalled) {
      setShowInstructions(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [isInstalled])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    haptics.medium()
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setIsInstalled(true)
      setShowPrompt(false)
    }
    
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    haptics.light()
    setShowPrompt(false)
    setShowInstructions(false)
  }

  if (isInstalled) return null

  return (
    <>
      {/* Install Prompt for PWA-capable browsers */}
      {showPrompt && deferredPrompt && (
        <div className="fixed bottom-24 left-4 right-4 z-40 animate-slide-up lg:left-auto lg:right-6 lg:max-w-sm">
          <Card className="glass apple-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-xl">
                    <Download className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">앱으로 설치하기</CardTitle>
                    <CardDescription className="text-sm">
                      홈 화면에서 빠르게 접근하세요
                    </CardDescription>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-2">
                <Button 
                  onClick={handleInstallClick} 
                  className="flex-1"
                  size="sm"
                >
                  설치하기
                </Button>
                <Button 
                  onClick={handleDismiss} 
                  variant="outline"
                  size="sm"
                >
                  나중에
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* iOS Safari Instructions */}
      {showInstructions && (
        <div className="fixed bottom-24 left-4 right-4 z-40 animate-slide-up lg:left-auto lg:right-6 lg:max-w-sm">
          <Card className="glass apple-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-xl">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">홈 화면에 추가</CardTitle>
                    <CardDescription className="text-sm">
                      앱처럼 사용하실 수 있습니다
                    </CardDescription>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">1.</span>
                  <span>하단의 공유 버튼을 누르세요</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">2.</span>
                  <span>"홈 화면에 추가"를 선택하세요</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">3.</span>
                  <span>"추가"를 눌러 완료하세요</span>
                </div>
              </div>
              <Button 
                onClick={handleDismiss} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                확인
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}