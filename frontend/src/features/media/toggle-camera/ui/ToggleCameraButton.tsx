/**
 * Toggle Camera Button Component
 */

import React from 'react'
import { useToggleCamera } from '../model/useToggleCamera'

interface ToggleCameraButtonProps {
  className?: string
}

export const ToggleCameraButton: React.FC<ToggleCameraButtonProps> = ({
  className = '',
}) => {
  const { isVideoEnabled, toggleCamera } = useToggleCamera()

  return (
    <button
      onClick={toggleCamera}
      className={`toggle-camera-button ${className}`}
      style={{
        padding: '15px',
        backgroundColor: isVideoEnabled ? '#4CAF50' : '#f44336',
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
      title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
    >
      {isVideoEnabled ? '📹' : '🚫'}
    </button>
  )
}
