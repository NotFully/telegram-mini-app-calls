/**
 * Application Router
 */

import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from '@/pages/home'
import { CallPage } from '@/pages/call'
import { useCallStore } from '@/entities/call/model'
import { CallProvider } from '../providers'

const ProtectedCallRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const status = useCallStore((state) => state.status)

  // Allow access if status is connecting, ringing, or connected
  // Only redirect if status is idle, ended, or failed
  if (status === 'idle' || status === 'ended' || status === 'failed') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <CallProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/call"
            element={
              <ProtectedCallRoute>
                <CallPage />
              </ProtectedCallRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CallProvider>
    </BrowserRouter>
  )
}
