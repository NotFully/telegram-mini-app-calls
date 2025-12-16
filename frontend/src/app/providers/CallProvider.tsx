/**
 * Call Provider - handles incoming calls globally
 */

import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { wsClient } from '@/shared/api/websocket'
import { useCallStore } from '@/entities/call/model'

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleIncomingCall = (message: any) => {
      // Handle incoming offer (incoming call)
      if (message.type === 'offer') {
        const { from_user_id, room_id, sdp } = message

        // Only handle if not already on call page
        if (location.pathname !== '/call') {
          console.log('[CallProvider] Incoming call from user', from_user_id, 'room', room_id)
          console.log('[CallProvider] SDP offer received:', sdp ? 'YES' : 'NO')

          // Set call state to incoming
          useCallStore.getState().setRemoteUserId(from_user_id)
          useCallStore.getState().setRoomId(room_id || null)
          useCallStore.getState().setIsIncoming(true)
          useCallStore.getState().setStatus('connecting')
          useCallStore.getState().setPendingOffer(message)

          console.log('[CallProvider] Navigating to /call')
          // Navigate to call page
          navigate('/call')
        } else {
          console.log('[CallProvider] Already on /call page, ignoring offer')
        }
      }
    }

    const unsubscribe = wsClient.onMessage(handleIncomingCall)

    return () => {
      unsubscribe()
    }
  }, [navigate, location])

  return <>{children}</>
}
