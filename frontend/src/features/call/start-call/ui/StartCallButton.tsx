/**
 * Start Call Button Component
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStartCall } from '../model/useStartCall'
import { useUserStore } from '@/entities/user/model'

interface StartCallButtonProps {
  targetUserId: number
  targetUserName: string
  className?: string
}

export const StartCallButton: React.FC<StartCallButtonProps> = ({
  targetUserId,
  targetUserName,
  className = '',
}) => {
  const navigate = useNavigate()
  const { startCall, isLoading } = useStartCall()
  const currentUser = useUserStore((state) => state.currentUser)

  const handleStartCall = async () => {
    if (!currentUser) {
      console.error('Current user not found')
      return
    }

    try {
      await startCall(targetUserId, currentUser.id)
      // Navigate to call page after starting call
      navigate('/call')
    } catch (error) {
      console.error('Failed to start call:', error)
    }
  }

  return (
    <button
      onClick={handleStartCall}
      disabled={isLoading}
      className={`start-call-button ${className}`}
      style={{
        padding: '10px 20px',
        backgroundColor: isLoading ? '#ccc' : '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        fontSize: '16px',
      }}
    >
      {isLoading ? 'Starting...' : `Call ${targetUserName}`}
    </button>
  )
}
