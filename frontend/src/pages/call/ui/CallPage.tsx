/**
 * Call Page - Active call page with video and controls
 */

import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { VideoCallWidget } from '@/widgets/video-call'
import { CallControlsWidget } from '@/widgets/call-controls'
import { IncomingCallWidget } from '@/widgets/incoming-call'
import { useCallStore } from '@/entities/call/model'
import { wsClient } from '@/shared/api/websocket'
import { formatDuration } from '@/shared/lib/utils'
import { PeerConnection } from '@/shared/lib/webrtc'
import { mediaStreamManager } from '@/shared/lib/webrtc/media-stream'

export const CallPage: React.FC = () => {
  const navigate = useNavigate()
  const { status, duration, roomId, remoteUserId, peerConnection, isIncoming, pendingOffer, pendingIceCandidates } = useCallStore()
  const durationIntervalRef = useRef<number>()
  const hasProcessedOffer = useRef(false)

  // Handle accepting incoming call
  const handleAcceptCall = async () => {
    console.log('[CallPage] Call accepted by user')
    useCallStore.getState().setStatus('connecting')
  }

  // Handle rejecting incoming call
  const handleRejectCall = () => {
    console.log('[CallPage] Call rejected by user')

    // Send call-rejected message to caller
    if (remoteUserId) {
      wsClient.send({
        type: 'call-rejected',
        target_user_id: remoteUserId,
      })
    }

    // Clear pending ICE candidates
    useCallStore.getState().clearPendingIceCandidates()

    // Reset call state and go home
    useCallStore.getState().reset()
    navigate('/')
  }

  // Join room for incoming calls (when call is accepted)
  useEffect(() => {
    if (isIncoming && roomId && status === 'connecting') {
      console.log('[CallPage] Joining room for incoming call:', roomId)
      wsClient.send({
        type: 'join-room',
        room_id: roomId,
      })
    }
  }, [isIncoming, roomId, status])

  // Process pending offer for incoming calls (when call is accepted)
  useEffect(() => {
    const processPendingOffer = async () => {
      if (pendingOffer && isIncoming && status === 'connecting' && !hasProcessedOffer.current) {
        hasProcessedOffer.current = true
        console.log('[CallPage] Processing pending offer from user', pendingOffer.from_user_id)

        try {
          // Get user media (for incoming calls, start with audio only)
          console.log('[CallPage] Requesting user media (audio only for incoming call)')
          const localStream = await mediaStreamManager.getUserMedia({
            audio: true,
            video: false,
          })
          useCallStore.getState().setLocalStream(localStream)
          useCallStore.getState().setVideoEnabled(false)
          console.log('[CallPage] Local stream obtained (audio only)')

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
          // Apply pending ICE candidates
          console.log(`[CallPage] Applying ${pendingIceCandidates.length} pending ICE candidates`)
          for (const candidate of pendingIceCandidates) {
            try {
              await pc.addIceCandidate(candidate)
              console.log('[CallPage] Pending ICE candidate applied')
            } catch (err) {
              console.error('[CallPage] Error adding pending ICE candidate:', err)
            }
          }
          useCallStore.getState().clearPendingIceCandidates()
        } catch (error) {
          console.error('[CallPage] Error processing pending offer:', error)
          useCallStore.getState().setStatus('failed')
        }
      }
    }

    processPendingOffer()
  }, [pendingOffer, isIncoming, roomId, status, pendingIceCandidates])

  // Handle WebSocket messages
  useEffect(() => {
    const handleMessage = async (message: any) => {
      try {
        switch (message.type) {
          case 'call-rejected':
            // Other user rejected the call
            console.log('[CallPage] Call was rejected by other user')
            useCallStore.getState().setError('Звонок отклонен')
            useCallStore.getState().setStatus('failed')
            setTimeout(() => {
              navigate('/')
            }, 2000)
            break

          case 'answer':
            // Handle answer
            console.log('[CallPage] Received answer from user', message.from_user_id)
            if (peerConnection) {
              console.log('[CallPage] Setting remote description from answer')
              await peerConnection.setRemoteDescription(message.sdp)
              console.log('[CallPage] Remote description set successfully')
            } else {
              console.error('[CallPage] No peer connection available to set answer')
            }
            break

          case 'ice-candidate':
            // Handle ICE candidate
            console.log('[CallPage] Received ICE candidate from user', message.from_user_id)
            if (peerConnection && message.candidate) {
              await peerConnection.addIceCandidate(message.candidate)
              console.log('[CallPage] ICE candidate added successfully')
            } else if (!peerConnection && message.candidate) {
              // Peer connection not ready yet, save candidate for later
              console.log('[CallPage] Peer connection not ready, saving ICE candidate to queue')
              useCallStore.getState().addPendingIceCandidate(message.candidate)
              console.log('[CallPage] Pending ICE candidates:', useCallStore.getState().pendingIceCandidates.length)
            }
            break

          case 'user-left':
            // Other user left, end call
            console.log('[CallPage] Other user left the call')

            // Clean up peer connection
            if (peerConnection) {
              peerConnection.connection?.close()
            }

            // Stop local media streams
            const localStream = useCallStore.getState().localStream
            if (localStream) {
              localStream.getTracks().forEach(track => track.stop())
            }

            // Reset call state
            useCallStore.getState().reset()

            // Navigate home
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

  // Show incoming call screen for ringing status
  if (status === 'ringing' && isIncoming) {
    return (
      <IncomingCallWidget
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />
    )
  }

  // Show error message if call failed
  if (status === 'failed') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#1a1a1a',
          color: 'white',
          padding: '20px',
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '20px' }}>
          {useCallStore.getState().error || 'Звонок завершен'}
        </div>
      </div>
    )
  }

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
