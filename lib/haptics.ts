// Haptic feedback utility functions
export const haptics = {
  // Light impact for selections
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  },

  // Medium impact for button presses
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20)
    }
  },

  // Heavy impact for important actions
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(30)
    }
  },

  // Success pattern
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10])
    }
  },

  // Error pattern
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50])
    }
  },

  // Notification pattern
  notification: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }
  },

  // Custom pattern
  pattern: (pattern: number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  },

  // Check if haptics are supported
  isSupported: () => {
    return 'vibrate' in navigator
  }
}