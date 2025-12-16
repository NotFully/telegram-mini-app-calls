/**
 * End Call Button Component
 */

import React from 'react'
import { useEndCall } from '../model/useEndCall'

interface EndCallButtonProps {
  peerConnection?: RTCPeerConnection
  className?: string
}

export const EndCallButton: React.FC<EndCallButtonProps> = ({
  peerConnection,
  className = '',
}) => {
  const { endCall, isLoading } = useEndCall()

  const handleEndCall = async () => {
    await endCall(peerConnection)
  }

  return (
    <button
      onClick={handleEndCall}
      disabled={isLoading}
      className={`end-call-button ${className}`}
      style={{
        padding: '15px 30px',
        backgroundColor: isLoading ? '#ccc' : '#f44336',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        fontSize: '20px',
        width: '60px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      title="End Call"
    >
      ✕
    </button>
  )
}
