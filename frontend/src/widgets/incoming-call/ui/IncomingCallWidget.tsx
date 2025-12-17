/**
 * Incoming Call Widget - shows incoming call with accept/reject buttons
 */

import React from 'react'
import { useCallStore } from '@/entities/call/model'

interface IncomingCallWidgetProps {
  onAccept: () => void
  onReject: () => void
}

export const IncomingCallWidget: React.FC<IncomingCallWidgetProps> = ({
  onAccept,
  onReject,
}) => {
  const { remoteUserId } = useCallStore()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '20px',
      }}
    >
      <div
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '20px',
        }}
      >
        Входящий звонок
      </div>

      <div
        style={{
          fontSize: '18px',
          marginBottom: '60px',
          opacity: 0.8,
        }}
      >
        Пользователь {remoteUserId}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '30px',
          marginTop: 'auto',
          marginBottom: '60px',
        }}
      >
        {/* Reject button */}
        <button
          onClick={onReject}
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#ff3b30',
            color: 'white',
            fontSize: '30px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255, 59, 48, 0.4)',
          }}
        >
          ✕
        </button>

        {/* Accept button */}
        <button
          onClick={onAccept}
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#34c759',
            color: 'white',
            fontSize: '30px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(52, 199, 89, 0.4)',
          }}
        >
          ✓
        </button>
      </div>
    </div>
  )
}
