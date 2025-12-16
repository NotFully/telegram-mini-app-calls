/**
 * Call Controls Widget - Control buttons for call
 */

import React from 'react'
import { EndCallButton } from '@/features/call/end-call'
import { ToggleMicrophoneButton } from '@/features/media/toggle-microphone'
import { ToggleCameraButton } from '@/features/media/toggle-camera'

interface CallControlsWidgetProps {
  peerConnection?: RTCPeerConnection
}

export const CallControlsWidget: React.FC<CallControlsWidgetProps> = ({
  peerConnection,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '20px',
        padding: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '50px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
    >
      <ToggleMicrophoneButton />
      <EndCallButton peerConnection={peerConnection} />
      <ToggleCameraButton />
    </div>
  )
}
