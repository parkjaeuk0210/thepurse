'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'

export function ThemeToggle() {
  try {
    const { theme, setTheme } = useTheme()

    const toggleTheme = () => {
      if (theme === 'light') setTheme('dark')
      else if (theme === 'dark') setTheme('system')
      else setTheme('light')
    }

    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="h-9 w-9"
      >
        {theme === 'light' && <Sun className="h-4 w-4" />}
        {theme === 'dark' && <Moon className="h-4 w-4" />}
        {theme === 'system' && <Monitor className="h-4 w-4" />}
        <span className="sr-only">테마 변경</span>
      </Button>
    )
  } catch (error) {
    // Fallback when ThemeProvider is not available
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        disabled
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">테마 변경</span>
      </Button>
    )
  }
}