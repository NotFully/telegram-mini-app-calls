/**
 * WebRTC Peer Connection Helper
 */

import type { ICEServer } from '../../types'

const DEFAULT_ICE_SERVERS: ICEServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

export class PeerConnection {
  private pc: RTCPeerConnection | null = null
  private iceServers: ICEServer[]

  constructor(iceServers: ICEServer[] = DEFAULT_ICE_SERVERS) {
    this.iceServers = iceServers
  }

  /**
   * Create a new peer connection
   */
  create(): RTCPeerConnection {
    const configuration: RTCConfiguration = {
      iceServers: this.iceServers,
      iceCandidatePoolSize: 10,
    }

    this.pc = new RTCPeerConnection(configuration)
    return this.pc
  }

  /**
   * Get the peer connection instance
   */
  get connection(): RTCPeerConnection | null {
    return this.pc
  }

  /**
   * Add local stream to peer connection
   */
  addStream(stream: MediaStream) {
    if (!this.pc) {
      throw new Error('Peer connection not created')
    }

    stream.getTracks().forEach((track) => {
      this.pc!.addTrack(track, stream)
    })
  }

  /**
   * Create an offer
   */
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.pc) {
      throw new Error('Peer connection not created')
    }

    const offer = await this.pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    })

    await this.pc.setLocalDescription(offer)
    return offer
  }

  /**
   * Create an answer
   */
  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    if (!this.pc) {
      throw new Error('Peer connection not created')
    }

    const answer = await this.pc.createAnswer()
    await this.pc.setLocalDescription(answer)
    return answer
  }

  /**
   * Set remote description
   */
  async setRemoteDescription(description: RTCSessionDescriptionInit) {
    if (!this.pc) {
      throw new Error('Peer connection not created')
    }

    await this.pc.setRemoteDescription(new RTCSessionDescription(description))
  }

  /**
   * Add ICE candidate
   */
  async addIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.pc) {
      throw new Error('Peer connection not created')
    }

    await this.pc.addIceCandidate(new RTCIceCandidate(candidate))
  }

  /**
   * Close peer connection
   */
  close() {
    if (this.pc) {
      this.pc.close()
      this.pc = null
    }
  }

  /**
   * Set up event handlers
   */
  onIceCandidate(handler: (candidate: RTCIceCandidate) => void) {
    if (!this.pc) {
      throw new Error('Peer connection not created')
    }

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        handler(event.candidate)
      }
    }
  }

  onTrack(handler: (event: RTCTrackEvent) => void) {
    if (!this.pc) {
      throw new Error('Peer connection not created')
    }

    this.pc.ontrack = handler
  }

  onConnectionStateChange(handler: (state: RTCPeerConnectionState) => void) {
    if (!this.pc) {
      throw new Error('Peer connection not created')
    }

    this.pc.onconnectionstatechange = () => {
      if (this.pc) {
        handler(this.pc.connectionState)
      }
    }
  }

  onIceConnectionStateChange(handler: (state: RTCIceConnectionState) => void) {
    if (!this.pc) {
      throw new Error('Peer connection not created')
    }

    this.pc.oniceconnectionstatechange = () => {
      if (this.pc) {
        handler(this.pc.iceConnectionState)
      }
    }
  }
}
