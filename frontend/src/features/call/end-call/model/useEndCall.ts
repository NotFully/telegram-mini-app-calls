/**
 * End call feature hook
 */

import { useState } from 'react'
import { useCallStore } from '@/entities/call/model'
import { useRoomStore } from '@/entities/room/model'
import { roomsApi } from '@/shared/api'
import { wsClient } from '@/shared/api/websocket'
import { mediaStreamManager } from '@/shared/lib/webrtc/media-stream'

export function useEndCall() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const callStore = useCallStore()
  const roomStore = useRoomStore()

  const endCall = async (peerConnection?: RTCPeerConnection) => {
    try {
      setIsLoading(true)
      setError(null)

      const { roomId } = callStore
      const currentUser = callStore.remoteUserId

      // Step 1: Close peer connection
      if (peerConnection) {
        peerConnection.close()
      }

      // Step 2: Stop local media streams
      mediaStreamManager.stopLocalStream()

      // Step 3: Leave WebSocket room
      if (roomId) {
        wsClient.send({
          type: 'leave-room',
          room_id: roomId,
        })

        // Step 4: Leave room via API
        if (currentUser) {
          await roomsApi.leaveRoom(roomId, currentUser)
        }
      }

      // Step 5: Reset stores
      callStore.endCall()
      roomStore.setCurrentRoom(null)

      setTimeout(() => {
        callStore.reset()
      }, 1000)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to end call'
      setError(errorMessage)
      console.error('Error ending call:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    endCall,
    isLoading,
    error,
  }
}
