/**
 * Video Call Widget - Main video call interface
 */

import React, { useEffect, useRef } from 'react'
import { useCallStore } from '@/entities/call/model'

export const VideoCallWidget: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const { localStream, remoteStream, status, isVideoEnabled } = useCallStore()

  // Set up local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  // Set up remote video
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Remote Video (main) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Local Video (picture-in-picture) */}
      {isVideoEnabled && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '150px',
            height: '200px',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            border: '2px solid #fff',
          }}
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)', // Mirror effect
            }}
          />
        </div>
      )}

      {/* Status indicator */}
      {status !== 'connected' && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#fff',
            fontSize: '24px',
            textAlign: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '20px 40px',
            borderRadius: '10px',
          }}
        >
          {status === 'connecting' && 'Connecting...'}
          {status === 'ringing' && 'Ringing...'}
          {status === 'failed' && 'Call Failed'}
          {status === 'ended' && 'Call Ended'}
        </div>
      )}
    </div>
  )
}
