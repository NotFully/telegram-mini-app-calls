/**
 * Call Page - Active call page with video and controls
 */

import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { VideoCallWidget } from '@/widgets/video-call'
import { CallControlsWidget } from '@/widgets/call-controls'
import { useCallStore } from '@/entities/call/model'
import { wsClient } from '@/shared/api/websocket'
import { formatDuration } from '@/shared/lib/utils'

export const CallPage: React.FC = () => {
  const navigate = useNavigate()
  const { status, duration, roomId, remoteUserId, peerConnection } = useCallStore()
  const durationIntervalRef = useRef<number>()

  // Handle WebSocket messages
  useEffect(() => {
    const handleMessage = async (message: any) => {
      if (!peerConnection) return

      try {
        switch (message.type) {
          case 'offer':
            // Handle incoming offer
            await peerConnection.setRemoteDescription(message.sdp)
            const answer = await peerConnection.createAnswer()

            wsClient.send({
              type: 'answer',
              room_id: roomId ?? undefined,
              target_user_id: message.from_user_id,
              sdp: answer,
            })
            break

          case 'answer':
            // Handle answer
            await peerConnection.setRemoteDescription(message.sdp)
            break

          case 'ice-candidate':
            // Handle ICE candidate
            if (message.candidate) {
              await peerConnection.addIceCandidate(message.candidate)
            }
            break

          case 'user-left':
            // Other user left, end call
            navigate('/')
            break
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error)
      }
    }

    const unsubscribe = wsClient.onMessage(handleMessage)

    return () => {
      unsubscribe()
    }
  }, [peerConnection, roomId, remoteUserId, navigate])

  // Handle call duration
  useEffect(() => {
    if (status === 'connected') {
      durationIntervalRef.current = window.setInterval(() => {
        useCallStore.getState().incrementDuration()
      }, 1000)
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }, [status])

  // Redirect when call ends
  useEffect(() => {
    if (status === 'ended' || status === 'failed') {
      const timeout = setTimeout(() => {
        navigate('/')
      }, 2000)

      return () => clearTimeout(timeout)
    }
  }, [status, navigate])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <VideoCallWidget />

      {status === 'connected' && (
        <CallControlsWidget peerConnection={peerConnection?.connection || undefined} />
      )}

      {/* Call duration */}
      {status === 'connected' && duration > 0 && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '20px',
            fontSize: '18px',
            fontWeight: 'bold',
          }}
        >
          {formatDuration(duration)}
        </div>
      )}
    </div>
  )
}
