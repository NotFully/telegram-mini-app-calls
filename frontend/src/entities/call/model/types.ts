/**
 * Call entity types
 */

import type { ICEServer } from '../../../shared/types'
import type { PeerConnection } from '../../../shared/lib/webrtc'

export type CallStatus =
  | 'idle'
  | 'connecting'
  | 'ringing'
  | 'connected'
  | 'ended'
  | 'failed'

export interface CallState {
  status: CallStatus
  roomId: string | null
  remoteUserId: number | null
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  peerConnection: PeerConnection | null
  pendingOffer: any | null
  pendingIceCandidates: any[]
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  isIncoming: boolean
  iceServers: ICEServer[]
  duration: number
  error: string | null
}

export interface CallActions {
  setStatus: (status: CallStatus) => void
  setRoomId: (roomId: string | null) => void
  setRemoteUserId: (userId: number | null) => void
  setLocalStream: (stream: MediaStream | null) => void
  setRemoteStream: (stream: MediaStream | null) => void
  setPeerConnection: (peerConnection: PeerConnection | null) => void
  setPendingOffer: (offer: any | null) => void
  addPendingIceCandidate: (candidate: any) => void
  clearPendingIceCandidates: () => void
  setAudioEnabled: (enabled: boolean) => void
  setVideoEnabled: (enabled: boolean) => void
  toggleAudio: () => void
  toggleVideo: () => void
  setIsIncoming: (isIncoming: boolean) => void
  setIceServers: (servers: ICEServer[]) => void
  setDuration: (duration: number) => void
  incrementDuration: () => void
  setError: (error: string | null) => void
  startCall: (roomId: string, remoteUserId: number) => void
  acceptCall: (roomId: string, remoteUserId: number) => void
  endCall: () => void
  reset: () => void
}

export type CallStore = CallState & CallActions
