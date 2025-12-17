/**
 * Toggle camera feature hook
 */

import { useCallStore } from '@/entities/call/model'
import { mediaStreamManager } from '@/shared/lib/webrtc/media-stream'
import { wsClient } from '@/shared/api/websocket'

export function useToggleCamera() {
  const { isVideoEnabled, setVideoEnabled, peerConnection, localStream, setLocalStream, roomId, remoteUserId } = useCallStore()

  const toggleCamera = async () => {
    try {
      if (isVideoEnabled) {
        // Disable video - just disable the track without removing it
        console.log('[useToggleCamera] Disabling video')
        const videoTrack = localStream?.getVideoTracks()[0]
        if (videoTrack) {
          videoTrack.enabled = false
        }
        setVideoEnabled(false)
      } else {
        // Enable video
        console.log('[useToggleCamera] Enabling video')

        // Check if we already have a video track
        const existingVideoTrack = localStream?.getVideoTracks()[0]

        if (existingVideoTrack) {
          // Just re-enable existing track
          console.log('[useToggleCamera] Re-enabling existing video track')
          existingVideoTrack.enabled = true
          setVideoEnabled(true)
        } else {
          // Need to add new video track
          console.log('[useToggleCamera] Adding new video track')
          const updatedStream = await mediaStreamManager.enableVideo()
          setLocalStream(updatedStream)
          setVideoEnabled(true)

          // Update peer connection sender by replacing track
          if (peerConnection?.connection) {
            const videoTrack = updatedStream.getVideoTracks()[0]
            if (videoTrack) {
              // Find video sender or add new one
              const senders = peerConnection.connection.getSenders()
              const videoSender = senders.find(s => s.track?.kind === 'video')

              if (videoSender && videoSender.track) {
                // Replace existing video track
                console.log('[useToggleCamera] Replacing video track')
                await videoSender.replaceTrack(videoTrack)
              } else {
                // Add new video track - requires renegotiation
                console.log('[useToggleCamera] Adding video track to peer connection')
                peerConnection.connection.addTrack(videoTrack, updatedStream)

                // Renegotiate to send new offer with video track
                console.log('[useToggleCamera] Creating new offer for renegotiation')
                const offer = await peerConnection.createOffer()

                // Send new offer to remote peer
                if (roomId && remoteUserId) {
                  wsClient.send({
                    type: 'offer',
                    room_id: roomId,
                    target_user_id: remoteUserId,
                    sdp: offer,
                    video_enabled: true,
                  })
                  console.log('[useToggleCamera] Renegotiation offer sent')
                }
              }
            }
          }
        }
      }

      return !isVideoEnabled
    } catch (error) {
      console.error('[useToggleCamera] Error toggling camera:', error)
      return isVideoEnabled
    }
  }

  const setCamera = async (enabled: boolean) => {
    if (enabled !== isVideoEnabled) {
      await toggleCamera()
    }
  }

  return {
    isVideoEnabled,
    toggleCamera,
    setCamera,
  }
}
