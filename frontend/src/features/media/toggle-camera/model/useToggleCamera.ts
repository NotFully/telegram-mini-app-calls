/**
 * Toggle camera feature hook
 */

import { useCallStore } from '@/entities/call/model'
import { mediaStreamManager } from '@/shared/lib/webrtc/media-stream'

export function useToggleCamera() {
  const { isVideoEnabled, setVideoEnabled } = useCallStore()

  const toggleCamera = () => {
    const newState = mediaStreamManager.toggleVideo()
    setVideoEnabled(newState)
    return newState
  }

  const setCamera = (enabled: boolean) => {
    mediaStreamManager.toggleVideo(enabled)
    setVideoEnabled(enabled)
  }

  return {
    isVideoEnabled,
    toggleCamera,
    setCamera,
  }
}
