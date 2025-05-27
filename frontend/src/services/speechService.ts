const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface SpeechAnalysisResult {
  transcription: string;
  confidence: number;
  pronunciationScore: number;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  wordDetails: WordAnalysis[];
  overallScore: number;
  feedback: string[];
}

export interface WordAnalysis {
  word: string;
  accuracyScore: number;
  errorType?: 'None' | 'Omission' | 'Insertion' | 'Mispronunciation';
  phonemes: PhonemeAnalysis[];
}

export interface PhonemeAnalysis {
  phoneme: string;
  accuracyScore: number;
}

export interface ShadowingAnalysis {
  originalText: string;
  userText: string;
  pronunciationAnalysis: SpeechAnalysisResult;
  rhythmAnalysis: RhythmAnalysis;
  suggestions: string[];
  overallScore: number;
}

export interface RhythmAnalysis {
  tempo: number;
  pauses: PauseAnalysis[];
  rhythm_score: number;
}

export interface PauseAnalysis {
  start: number;
  duration: number;
  type: 'natural' | 'hesitation' | 'excessive';
}

export interface Voice {
  name: string;
  displayName: string;
  gender: string;
  locale: string;
  recommended: boolean;
}

export interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
}

export interface TTSResponse {
  audioUrl: string;
  text: string;
  voice: string;
  speed: number;
  duration: number;
}

class SpeechService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private getFormAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  /**
   * Analyze pronunciation of audio file
   */
  async analyzePronunciation(
    audioBlob: Blob,
    referenceText: string
  ): Promise<SpeechAnalysisResult> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('referenceText', referenceText);

    const response = await fetch(`${API_BASE_URL}/api/speech/analyze-pronunciation`, {
      method: 'POST',
      headers: this.getFormAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze pronunciation');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Perform comprehensive shadowing analysis
   */
  async analyzeShadowing(
    audioBlob: Blob,
    referenceText: string,
    materialId?: string
  ): Promise<ShadowingAnalysis> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('referenceText', referenceText);
    if (materialId) {
      formData.append('materialId', materialId);
    }

    const response = await fetch(`${API_BASE_URL}/api/speech/analyze-shadowing`, {
      method: 'POST',
      headers: this.getFormAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze shadowing');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get list of supported languages
   */
  async getSupportedLanguages(): Promise<{ code: string; name: string; default: boolean }[]> {
    const response = await fetch(`${API_BASE_URL}/api/speech/supported-languages`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch supported languages');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Generate speech from text
   */
  async textToSpeech(request: TTSRequest): Promise<TTSResponse> {
    const response = await fetch(`${API_BASE_URL}/api/speech/text-to-speech`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate speech');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get available voices for text-to-speech
   */
  async getAvailableVoices(): Promise<Voice[]> {
    const response = await fetch(`${API_BASE_URL}/api/speech/voices`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch available voices');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Convert audio blob to WAV format for better compatibility
   */
  async convertToWav(audioBlob: Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      audio.onloadeddata = async () => {
        try {
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Convert to WAV
          const wavBlob = this.audioBufferToWav(audioBuffer);
          resolve(wavBlob);
        } catch (error) {
          reject(error);
        }
      };
      
      audio.onerror = () => reject(new Error('Failed to load audio'));
      audio.src = URL.createObjectURL(audioBlob);
    });
  }

  /**
   * Convert AudioBuffer to WAV Blob
   */
  private audioBufferToWav(buffer: AudioBuffer): Blob {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    // PCM data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  /**
   * Calculate audio duration from blob
   */
  async getAudioDuration(audioBlob: Blob): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      };
      audio.onerror = () => reject(new Error('Failed to load audio'));
      audio.src = URL.createObjectURL(audioBlob);
    });
  }
}

export const speechService = new SpeechService();
