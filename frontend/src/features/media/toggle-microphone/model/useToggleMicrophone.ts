/**
 * Toggle microphone feature hook
 */

import { useCallStore } from '@/entities/call/model'
import { mediaStreamManager } from '@/shared/lib/webrtc/media-stream'

export function useToggleMicrophone() {
  const { isAudioEnabled, setAudioEnabled } = useCallStore()

  const toggleMicrophone = () => {
    const newState = mediaStreamManager.toggleAudio()
    setAudioEnabled(newState)
    return newState
  }

  const setMicrophone = (enabled: boolean) => {
    mediaStreamManager.toggleAudio(enabled)
    setAudioEnabled(enabled)
  }

  return {
    isAudioEnabled,
    toggleMicrophone,
    setMicrophone,
  }
}
