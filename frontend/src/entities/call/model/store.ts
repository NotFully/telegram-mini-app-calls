/**
 * Call entity store using Zustand
 */

import { create } from 'zustand'
import type { CallStore, CallStatus } from './types'

const initialState = {
  status: 'idle' as CallStatus,
  roomId: null,
  remoteUserId: null,
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  pendingOffer: null,
  pendingIceCandidates: [],
  isAudioEnabled: true,
  isVideoEnabled: true,
  isIncoming: false,
  iceServers: [],
  duration: 0,
  error: null,
}

export const useCallStore = create<CallStore>((set) => ({
  ...initialState,

  setStatus: (status) => set({ status }),

  setRoomId: (roomId) => set({ roomId }),

  setRemoteUserId: (userId) => set({ remoteUserId: userId }),

  setLocalStream: (stream) => set({ localStream: stream }),

  setRemoteStream: (stream) => set({ remoteStream: stream }),

  setPeerConnection: (peerConnection) => set({ peerConnection }),

  setPendingOffer: (offer) => set({ pendingOffer: offer }),

  addPendingIceCandidate: (candidate) =>
    set((state) => ({
      pendingIceCandidates: [...state.pendingIceCandidates, candidate],
    })),

  clearPendingIceCandidates: () => set({ pendingIceCandidates: [] }),

  setAudioEnabled: (enabled) => set({ isAudioEnabled: enabled }),

  setVideoEnabled: (enabled) => set({ isVideoEnabled: enabled }),

  toggleAudio: () =>
    set((state) => ({ isAudioEnabled: !state.isAudioEnabled })),

  toggleVideo: () =>
    set((state) => ({ isVideoEnabled: !state.isVideoEnabled })),

  setIsIncoming: (isIncoming) => set({ isIncoming }),

  setIceServers: (servers) => set({ iceServers: servers }),

  setDuration: (duration) => set({ duration }),

  incrementDuration: () => set((state) => ({ duration: state.duration + 1 })),

  setError: (error) => set({ error }),

  startCall: (roomId, remoteUserId) =>
    set({
      status: 'connecting',
      roomId,
      remoteUserId,
      isIncoming: false,
      error: null,
    }),

  acceptCall: (roomId, remoteUserId) =>
    set({
      status: 'connecting',
      roomId,
      remoteUserId,
      isIncoming: true,
      error: null,
    }),

  endCall: () =>
    set({
      status: 'ended',
      localStream: null,
      remoteStream: null,
      peerConnection: null,
    }),

  reset: () => set(initialState),
}))
