/**
 * Main App Component
 */

import React, { useEffect } from 'react'
import { AppRouter } from './router'
import { TelegramProvider } from './providers'
import { useCallStore } from '@/entities/call/model'
import { useNavigate } from 'react-router-dom'
import './styles/index.css'

const AppContent: React.FC = () => {
  const navigate = useNavigate()
  const status = useCallStore((state) => state.status)

  // Navigate to call page when call starts
  useEffect(() => {
    if (status === 'connecting' || status === 'ringing') {
      navigate('/call')
    }
  }, [status, navigate])

  return null
}

export const App: React.FC = () => {
  return (
    <TelegramProvider>
      <AppRouter />
    </TelegramProvider>
  )
}
