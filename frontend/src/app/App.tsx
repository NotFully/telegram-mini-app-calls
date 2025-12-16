/**
 * Main App Component
 */

import React from 'react'
import { AppRouter } from './router'
import { TelegramProvider, CallProvider } from './providers'
import './styles/index.css'

export const App: React.FC = () => {
  return (
    <TelegramProvider>
      <CallProvider>
        <AppRouter />
      </CallProvider>
    </TelegramProvider>
  )
}
