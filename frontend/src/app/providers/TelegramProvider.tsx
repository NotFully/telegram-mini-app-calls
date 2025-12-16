/**
 * Telegram Provider - Initialize Telegram SDK and authenticate user
 */

import React, { useEffect, useState } from 'react'
import { telegramSDK } from '@/shared/lib/telegram'
import { authApi, wsClient } from '@/shared/api'
import { useUserStore } from '@/entities/user/model'

interface TelegramProviderProps {
  children: React.ReactNode
}

export const TelegramProvider: React.FC<TelegramProviderProps> = ({
  children,
}) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setCurrentUser, setError: setUserError } = useUserStore()

  useEffect(() => {
    const initializeTelegram = async () => {
      try {
        // Initialize Telegram SDK
        telegramSDK.init()

        // Get user data from Telegram
        const userData = telegramSDK.getUserData()

        if (!userData) {
          // For development/testing outside Telegram
          console.warn('Telegram user data not available, using mock user')
          const mockUser = {
            id: 1,
            telegram_id: 123456789,
            username: 'testuser',
            first_name: 'Test',
            last_name: 'User',
            is_online: true,
            created_at: new Date().toISOString(),
          }
          setCurrentUser(mockUser)
          setIsInitialized(true)
          return
        }

        // Authenticate with backend
        const authResponse = await authApi.telegramAuth(userData)

        // Set current user
        setCurrentUser({
          id: authResponse.user_id,
          telegram_id: authResponse.telegram_id,
          username: authResponse.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
          photo_url: userData.photo_url,
          is_online: true,
          created_at: new Date().toISOString(),
        })

        // Connect to WebSocket
        await wsClient.connect(authResponse.user_id)

        setIsInitialized(true)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to initialize'
        setError(errorMessage)
        setUserError(errorMessage)
        console.error('Telegram initialization error:', err)
      }
    }

    initializeTelegram()

    // Cleanup
    return () => {
      wsClient.disconnect()
    }
  }, [setCurrentUser, setUserError])

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <h2>Error</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  if (!isInitialized) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '48px',
              marginBottom: '20px',
            }}
          >
            ⏳
          </div>
          <p>Initializing...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
