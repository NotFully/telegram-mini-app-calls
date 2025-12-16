/**
 * Start call feature hook
 */

import { useState } from 'react'
import { useCallStore } from '@/entities/call/model'
import { useRoomStore } from '@/entities/room/model'
import { roomsApi } from '@/shared/api'
import { wsClient } from '@/shared/api/websocket'
import { PeerConnection } from '@/shared/lib/webrtc'
import { mediaStreamManager } from '@/shared/lib/webrtc/media-stream'

export function useStartCall() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const callStore = useCallStore()
  const roomStore = useRoomStore()

  const startCall = async (targetUserId: number, creatorId: number) => {
    try {
      setIsLoading(true)
      setError(null)

      // Step 1: Create room
      const { room_id } = await roomsApi.createRoom(creatorId)

      // Step 2: Join WebSocket room
      wsClient.send({
        type: 'join-room',
        room_id,
      })

      // Step 3: Get user media
      const localStream = await mediaStreamManager.getUserMedia()
      callStore.setLocalStream(localStream)

      // Step 4: Create peer connection
      const peerConnection = new PeerConnection(callStore.iceServers)
      peerConnection.create()
      peerConnection.addStream(localStream)

      // Step 5: Set up ICE candidate handler
      peerConnection.onIceCandidate((candidate) => {
        wsClient.send({
          type: 'ice-candidate',
          room_id,
          target_user_id: targetUserId,
          candidate: candidate.toJSON(),
        })
      })

      // Step 6: Set up remote track handler
      peerConnection.onTrack((event) => {
        const [remoteStream] = event.streams
        callStore.setRemoteStream(remoteStream)
        callStore.setStatus('connected')
      })

      // Step 7: Create and send offer
      const offer = await peerConnection.createOffer()
      wsClient.send({
        type: 'offer',
        room_id,
        target_user_id: targetUserId,
        sdp: offer,
      })

      // Update stores
      callStore.startCall(room_id, targetUserId)
      roomStore.setCurrentRoom({
        id: room_id,
        creator_id: creatorId,
        is_active: true,
        created_at: new Date().toISOString(),
        participants: [],
      })

      return { room_id, peerConnection }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to start call'
      setError(errorMessage)
      callStore.setError(errorMessage)
      callStore.setStatus('failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    startCall,
    isLoading,
    error,
  }
}
