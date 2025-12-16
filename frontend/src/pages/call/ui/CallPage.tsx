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
import { PeerConnection } from '@/shared/lib/webrtc'
import { mediaStreamManager } from '@/shared/lib/webrtc/media-stream'

export const CallPage: React.FC = () => {
  const navigate = useNavigate()
  const { status, duration, roomId, remoteUserId, peerConnection, isIncoming, pendingOffer } = useCallStore()
  const durationIntervalRef = useRef<number>()
  const hasProcessedOffer = useRef(false)

  // Join room for incoming calls
  useEffect(() => {
    if (isIncoming && roomId) {
      console.log('[CallPage] Joining room for incoming call:', roomId)
      wsClient.send({
        type: 'join-room',
        room_id: roomId,
      })
    }
  }, [isIncoming, roomId])

  // Process pending offer for incoming calls
  useEffect(() => {
    const processPendingOffer = async () => {
      if (pendingOffer && isIncoming && !hasProcessedOffer.current) {
        hasProcessedOffer.current = true
        console.log('[CallPage] Processing pending offer from user', pendingOffer.from_user_id)

        try {
          // Get user media
          console.log('[CallPage] Requesting user media')
          const localStream = await mediaStreamManager.getUserMedia()
          useCallStore.getState().setLocalStream(localStream)
          console.log('[CallPage] Local stream obtained')

          // Create peer connection
          console.log('[CallPage] Creating peer connection')
          const pc = new PeerConnection(useCallStore.getState().iceServers)
          pc.create()
          pc.addStream(localStream)
          useCallStore.getState().setPeerConnection(pc)

          // Set up ICE candidate handler
          pc.onIceCandidate((candidate) => {
            console.log('[CallPage] Sending ICE candidate to user', pendingOffer.from_user_id)
            wsClient.send({
              type: 'ice-candidate',
              room_id: roomId ?? undefined,
              target_user_id: pendingOffer.from_user_id,
              candidate: candidate.toJSON(),
            })
          })

          // Set up remote track handler
          pc.onTrack((event) => {
            console.log('[CallPage] Remote track received')
            const [remoteStream] = event.streams
            useCallStore.getState().setRemoteStream(remoteStream)
            useCallStore.getState().setStatus('connected')
          })

          // Set remote description and create answer
          console.log('[CallPage] Setting remote description')
          await pc.setRemoteDescription(pendingOffer.sdp)
          console.log('[CallPage] Creating answer')
          const answer = await pc.createAnswer()

          console.log('[CallPage] Sending answer to user', pendingOffer.from_user_id)
          wsClient.send({
            type: 'answer',
            room_id: roomId ?? undefined,
            target_user_id: pendingOffer.from_user_id,
            sdp: answer,
          })

          // Clear pending offer
          useCallStore.getState().setPendingOffer(null)
        } catch (error) {
          console.error('[CallPage] Error processing pending offer:', error)
          useCallStore.getState().setStatus('failed')
        }
      }
    }

    processPendingOffer()
  }, [pendingOffer, isIncoming, roomId])

  // Handle WebSocket messages
  useEffect(() => {
    const handleMessage = async (message: any) => {
      try {
        switch (message.type) {
          case 'offer':
            // Handle incoming offer
            let pc = peerConnection

            // If no peer connection exists, create one for incoming call
            if (!pc) {
              // Get user media
              const localStream = await mediaStreamManager.getUserMedia()
              useCallStore.getState().setLocalStream(localStream)

              // Create peer connection
              pc = new PeerConnection(useCallStore.getState().iceServers)
              pc.create()
              pc.addStream(localStream)
              useCallStore.getState().setPeerConnection(pc)

              // Set up ICE candidate handler
              pc.onIceCandidate((candidate) => {
                wsClient.send({
                  type: 'ice-candidate',
                  room_id: roomId ?? undefined,
                  target_user_id: message.from_user_id,
                  candidate: candidate.toJSON(),
                })
              })

              // Set up remote track handler
              pc.onTrack((event) => {
                const [remoteStream] = event.streams
                useCallStore.getState().setRemoteStream(remoteStream)
                useCallStore.getState().setStatus('connected')
              })
            }

            await pc.setRemoteDescription(message.sdp)
            const answer = await pc.createAnswer()

            wsClient.send({
              type: 'answer',
              room_id: roomId ?? undefined,
              target_user_id: message.from_user_id,
              sdp: answer,
            })
            break

          case 'answer':
            // Handle answer
            if (peerConnection) {
              await peerConnection.setRemoteDescription(message.sdp)
            }
            break

          case 'ice-candidate':
            // Handle ICE candidate
            if (peerConnection && message.candidate) {
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
