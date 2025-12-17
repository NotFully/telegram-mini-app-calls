/**
 * Toggle camera feature hook
 */

import { useCallStore } from '@/entities/call/model'
import { mediaStreamManager } from '@/shared/lib/webrtc/media-stream'

export function useToggleCamera() {
  const { isVideoEnabled, setVideoEnabled, peerConnection, localStream, setLocalStream } = useCallStore()

  const toggleCamera = async () => {
    try {
      if (isVideoEnabled) {
        // Disable video
        console.log('[useToggleCamera] Disabling video')
        mediaStreamManager.disableVideo()
        setVideoEnabled(false)

        // Update peer connection sender
        if (peerConnection?.connection) {
          const senders = peerConnection.connection.getSenders()
          const videoSender = senders.find(s => s.track?.kind === 'video')
          if (videoSender) {
            peerConnection.connection.removeTrack(videoSender)
          }
        }
      } else {
        // Enable video
        console.log('[useToggleCamera] Enabling video')
        const updatedStream = await mediaStreamManager.enableVideo()
        setLocalStream(updatedStream)
        setVideoEnabled(true)

        // Update peer connection sender
        if (peerConnection?.connection && localStream) {
          const videoTrack = updatedStream.getVideoTracks()[0]
          if (videoTrack) {
            peerConnection.connection.addTrack(videoTrack, updatedStream)
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
