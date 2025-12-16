/**
 * Media Stream Helper for managing audio/video streams
 */

export interface MediaConstraints {
  audio: boolean | MediaTrackConstraints
  video: boolean | MediaTrackConstraints
}

const DEFAULT_CONSTRAINTS: MediaConstraints = {
  audio: true,
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user',
  },
}

export class MediaStreamManager {
  private localStream: MediaStream | null = null

  /**
   * Get user media (camera and microphone)
   */
  async getUserMedia(
    constraints: MediaConstraints = DEFAULT_CONSTRAINTS
  ): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
      return this.localStream
    } catch (error) {
      console.error('Error accessing media devices:', error)
      throw new Error('Failed to access camera or microphone')
    }
  }

  /**
   * Get the current local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  /**
   * Stop all tracks in the local stream
   */
  stopLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }
  }

  /**
   * Toggle audio track
   */
  toggleAudio(enabled?: boolean): boolean {
    if (!this.localStream) return false

    const audioTrack = this.localStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = enabled !== undefined ? enabled : !audioTrack.enabled
      return audioTrack.enabled
    }
    return false
  }

  /**
   * Toggle video track
   */
  toggleVideo(enabled?: boolean): boolean {
    if (!this.localStream) return false

    const videoTrack = this.localStream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = enabled !== undefined ? enabled : !videoTrack.enabled
      return videoTrack.enabled
    }
    return false
  }

  /**
   * Check if audio is enabled
   */
  isAudioEnabled(): boolean {
    if (!this.localStream) return false
    const audioTrack = this.localStream.getAudioTracks()[0]
    return audioTrack ? audioTrack.enabled : false
  }

  /**
   * Check if video is enabled
   */
  isVideoEnabled(): boolean {
    if (!this.localStream) return false
    const videoTrack = this.localStream.getVideoTracks()[0]
    return videoTrack ? videoTrack.enabled : false
  }

  /**
   * Get available media devices
   */
  async getDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return {
        audioInputs: devices.filter((device) => device.kind === 'audioinput'),
        videoInputs: devices.filter((device) => device.kind === 'videoinput'),
        audioOutputs: devices.filter((device) => device.kind === 'audiooutput'),
      }
    } catch (error) {
      console.error('Error enumerating devices:', error)
      return {
        audioInputs: [],
        videoInputs: [],
        audioOutputs: [],
      }
    }
  }

  /**
   * Switch camera (front/back)
   */
  async switchCamera() {
    if (!this.localStream) {
      throw new Error('No local stream available')
    }

    const videoTrack = this.localStream.getVideoTracks()[0]
    if (!videoTrack) {
      throw new Error('No video track available')
    }

    const currentFacingMode = videoTrack.getSettings().facingMode
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user'

    // Stop current video track
    videoTrack.stop()

    // Get new stream with switched camera
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: false,
      })

      const newVideoTrack = newStream.getVideoTracks()[0]

      // Replace track in local stream
      this.localStream.removeTrack(videoTrack)
      this.localStream.addTrack(newVideoTrack)

      return this.localStream
    } catch (error) {
      console.error('Error switching camera:', error)
      throw new Error('Failed to switch camera')
    }
  }
}

export const mediaStreamManager = new MediaStreamManager()
