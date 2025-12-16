/**
 * Telegram Mini App SDK Wrapper
 */

import type { TelegramAuthData } from '../../types'

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
            language_code?: string
            photo_url?: string
          }
          query_id?: string
          auth_date?: number
          hash?: string
        }
        version: string
        platform: string
        colorScheme: 'light' | 'dark'
        themeParams: {
          bg_color?: string
          text_color?: string
          hint_color?: string
          link_color?: string
          button_color?: string
          button_text_color?: string
        }
        isExpanded: boolean
        viewportHeight: number
        viewportStableHeight: number
        headerColor: string
        backgroundColor: string
        BackButton: {
          isVisible: boolean
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
          show: () => void
          hide: () => void
        }
        MainButton: {
          text: string
          color: string
          textColor: string
          isVisible: boolean
          isActive: boolean
          isProgressVisible: boolean
          setText: (text: string) => void
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
          show: () => void
          hide: () => void
          enable: () => void
          disable: () => void
          showProgress: (leaveActive: boolean) => void
          hideProgress: () => void
        }
        ready: () => void
        expand: () => void
        close: () => void
        enableClosingConfirmation: () => void
        disableClosingConfirmation: () => void
        onEvent: (eventType: string, eventHandler: () => void) => void
        offEvent: (eventType: string, eventHandler: () => void) => void
        sendData: (data: string) => void
        openLink: (url: string) => void
        openTelegramLink: (url: string) => void
        openInvoice: (url: string, callback?: (status: string) => void) => void
        showPopup: (
          params: {
            title?: string
            message: string
            buttons?: Array<{
              id?: string
              type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
              text?: string
            }>
          },
          callback?: (buttonId: string) => void
        ) => void
        showAlert: (message: string, callback?: () => void) => void
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
      }
    }
  }
}

class TelegramSDK {
  private webApp: typeof window.Telegram.WebApp | null = null

  /**
   * Initialize Telegram Web App
   */
  init(): void {
    if (window.Telegram?.WebApp) {
      this.webApp = window.Telegram.WebApp
      this.webApp.ready()
      this.webApp.expand()
    } else {
      console.warn('Telegram WebApp not available')
    }
  }

  /**
   * Check if running in Telegram
   */
  isAvailable(): boolean {
    return this.webApp !== null
  }

  /**
   * Get user data from Telegram
   */
  getUserData(): TelegramAuthData | null {
    if (!this.webApp?.initDataUnsafe?.user) {
      return null
    }

    const user = this.webApp.initDataUnsafe.user
    return {
      telegram_id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      photo_url: user.photo_url,
    }
  }

  /**
   * Get theme parameters
   */
  getThemeParams() {
    return this.webApp?.themeParams || {}
  }

  /**
   * Get color scheme
   */
  getColorScheme(): 'light' | 'dark' {
    return this.webApp?.colorScheme || 'light'
  }

  /**
   * Show back button
   */
  showBackButton(onClick: () => void) {
    if (this.webApp?.BackButton) {
      this.webApp.BackButton.onClick(onClick)
      this.webApp.BackButton.show()
    }
  }

  /**
   * Hide back button
   */
  hideBackButton() {
    if (this.webApp?.BackButton) {
      this.webApp.BackButton.hide()
    }
  }

  /**
   * Show main button
   */
  showMainButton(text: string, onClick: () => void) {
    if (this.webApp?.MainButton) {
      this.webApp.MainButton.setText(text)
      this.webApp.MainButton.onClick(onClick)
      this.webApp.MainButton.show()
    }
  }

  /**
   * Hide main button
   */
  hideMainButton() {
    if (this.webApp?.MainButton) {
      this.webApp.MainButton.hide()
    }
  }

  /**
   * Show alert
   */
  showAlert(message: string, callback?: () => void) {
    if (this.webApp) {
      this.webApp.showAlert(message, callback)
    } else {
      alert(message)
      callback?.()
    }
  }

  /**
   * Show confirm
   */
  showConfirm(message: string, callback?: (confirmed: boolean) => void) {
    if (this.webApp) {
      this.webApp.showConfirm(message, callback)
    } else {
      const confirmed = confirm(message)
      callback?.(confirmed)
    }
  }

  /**
   * Close Mini App
   */
  close() {
    if (this.webApp) {
      this.webApp.close()
    }
  }

  /**
   * Enable closing confirmation
   */
  enableClosingConfirmation() {
    if (this.webApp) {
      this.webApp.enableClosingConfirmation()
    }
  }

  /**
   * Disable closing confirmation
   */
  disableClosingConfirmation() {
    if (this.webApp) {
      this.webApp.disableClosingConfirmation()
    }
  }

  /**
   * Get viewport height
   */
  getViewportHeight(): number {
    return this.webApp?.viewportHeight || window.innerHeight
  }

  /**
   * Open link
   */
  openLink(url: string) {
    if (this.webApp) {
      this.webApp.openLink(url)
    } else {
      window.open(url, '_blank')
    }
  }
}

export const telegramSDK = new TelegramSDK()
