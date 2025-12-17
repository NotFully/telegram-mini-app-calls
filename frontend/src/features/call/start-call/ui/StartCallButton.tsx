/**
 * Start Call Button Component
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStartCall } from '../model/useStartCall'
import { useUserStore } from '@/entities/user/model'

interface StartCallButtonProps {
  targetUserId: number
  className?: string
}

export const StartCallButton: React.FC<StartCallButtonProps> = ({
  targetUserId,
  className = '',
}) => {
  const navigate = useNavigate()
  const { startCall, isLoading } = useStartCall()
  const currentUser = useUserStore((state) => state.currentUser)

  const handleStartCall = async (videoEnabled: boolean) => {
    if (!currentUser) {
      console.error('Current user not found')
      return
    }

    try {
      await startCall(targetUserId, currentUser.id, videoEnabled)
      // Navigate to call page after starting call
      navigate('/call')
    } catch (error) {
      console.error('Failed to start call:', error)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
      }}
      className={className}
    >
      {/* Audio call button */}
      <button
        onClick={() => handleStartCall(false)}
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          backgroundColor: isLoading ? '#ccc' : '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '20px' }}>🎤</span>
        {isLoading ? 'Starting...' : 'Audio'}
      </button>

      {/* Video call button */}
      <button
        onClick={() => handleStartCall(true)}
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          backgroundColor: isLoading ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '20px' }}>📹</span>
        {isLoading ? 'Starting...' : 'Video'}
      </button>
    </div>
  )
}
