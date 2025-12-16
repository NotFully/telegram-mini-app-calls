/**
 * Toggle Microphone Button Component
 */

import React from 'react'
import { useToggleMicrophone } from '../model/useToggleMicrophone'

interface ToggleMicrophoneButtonProps {
  className?: string
}

export const ToggleMicrophoneButton: React.FC<
  ToggleMicrophoneButtonProps
> = ({ className = '' }) => {
  const { isAudioEnabled, toggleMicrophone } = useToggleMicrophone()

  return (
    <button
      onClick={toggleMicrophone}
      className={`toggle-microphone-button ${className}`}
      style={{
        padding: '15px',
        backgroundColor: isAudioEnabled ? '#4CAF50' : '#f44336',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '20px',
        width: '60px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
    >
      {isAudioEnabled ? '🎤' : '🔇'}
    </button>
  )
}
