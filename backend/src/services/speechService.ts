import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { BlobServiceClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

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

class SpeechService {
  private speechConfig: sdk.SpeechConfig | null = null;
  private blobServiceClient: BlobServiceClient | null = null;
  private containerName = 'audio-recordings';
  private isAzureConfigured: boolean = false;

  constructor() {
    // Initialize Azure Speech Service
    const speechKey = process.env.AZURE_SPEECH_KEY;
    const speechRegion = process.env.AZURE_SPEECH_REGION;

    if (speechKey && speechRegion) {
      try {
        this.speechConfig = sdk.SpeechConfig.fromSubscription(
          speechKey,
          speechRegion
        );
        this.speechConfig.speechRecognitionLanguage = 'en-US';
        this.isAzureConfigured = true;
        logger.info('Azure Speech Service configured successfully');
      } catch (error) {
        logger.error('Failed to configure Azure Speech Service:', error);
        this.isAzureConfigured = false;
      }
    } else {
      logger.info(
        'Azure Speech Service credentials not provided - using mock mode for development'
      );
      this.isAzureConfigured = false;
    }

    // Initialize Azure Blob Storage
    const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    if (storageAccountName) {
      try {
        const credential = new DefaultAzureCredential();
        this.blobServiceClient = new BlobServiceClient(
          `https://${storageAccountName}.blob.core.windows.net`,
          credential
        );
        logger.info('Azure Blob Storage configured successfully');
      } catch (error) {
        logger.error('Failed to configure Azure Blob Storage:', error);
      }
    } else {
      logger.info('Azure Storage Account not configured - using local storage');
    }
  }
  /**
   * Analyze pronunciation using Azure Speech Service or mock data
   */
  async analyzePronunciation(
    audioFilePath: string,
    referenceText: string
  ): Promise<SpeechAnalysisResult> {
    if (!this.isAzureConfigured || !this.speechConfig) {
      logger.info('Using mock pronunciation analysis for development');
      return this.getMockPronunciationAnalysis(referenceText);
    }

    try {
      // Create audio configuration
      const audioConfig = sdk.AudioConfig.fromWavFileInput(
        fs.readFileSync(audioFilePath)
      );

      // Configure pronunciation assessment
      const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
        referenceText,
        sdk.PronunciationAssessmentGradingSystem.HundredMark,
        sdk.PronunciationAssessmentGranularity.Phoneme,
        true // Enable miscue assessment
      );

      // Create speech recognizer with pronunciation assessment
      const speechRecognizer = new sdk.SpeechRecognizer(
        this.speechConfig,
        audioConfig
      );
      pronunciationConfig.applyTo(speechRecognizer);

      return new Promise((resolve, reject) => {
        speechRecognizer.recognizeOnceAsync(
          (result: sdk.SpeechRecognitionResult) => {
            if (result.reason === sdk.ResultReason.RecognizedSpeech) {
              const pronunciationResult =
                sdk.PronunciationAssessmentResult.fromResult(result);

              const analysis: SpeechAnalysisResult = {
                transcription: result.text,
                confidence: 0.9, // Default confidence value as property doesn't exist in SDK
                pronunciationScore: pronunciationResult.pronunciationScore || 0,
                accuracyScore: pronunciationResult.accuracyScore || 0,
                fluencyScore: pronunciationResult.fluencyScore || 0,
                completenessScore: pronunciationResult.completenessScore || 0,
                wordDetails: this.parseWordDetails(pronunciationResult),
                overallScore: this.calculateOverallScore(pronunciationResult),
                feedback: this.generateFeedback(
                  pronunciationResult,
                  referenceText
                ),
              };

              resolve(analysis);
            } else {
              reject(
                new Error(`Speech recognition failed: ${result.errorDetails}`)
              );
            }
            speechRecognizer.close();
          }
        );
      });
    } catch (error) {
      logger.error('Pronunciation analysis failed:', error);
      throw error;
    }
  }
  /**
   * Perform shadowing analysis comparing user speech to reference audio
   */
  async analyzeShadowing(
    userAudioPath: string,
    referenceText: string
  ): Promise<ShadowingAnalysis> {
    if (!this.isAzureConfigured) {
      logger.info('Using mock shadowing analysis for development');
      return this.getMockShadowingAnalysis(referenceText, referenceText);
    }

    try {
      // Analyze pronunciation
      const pronunciationAnalysis = await this.analyzePronunciation(
        userAudioPath,
        referenceText
      );

      // Analyze rhythm and timing
      const rhythmAnalysis = await this.analyzeRhythm(userAudioPath);

      // Generate comprehensive suggestions
      const suggestions = this.generateShadowingSuggestions(
        pronunciationAnalysis,
        rhythmAnalysis,
        referenceText
      );

      // Calculate overall shadowing score
      const overallScore = this.calculateShadowingScore(
        pronunciationAnalysis,
        rhythmAnalysis
      );

      return {
        originalText: referenceText,
        userText: pronunciationAnalysis.transcription,
        pronunciationAnalysis,
        rhythmAnalysis,
        suggestions,
        overallScore,
      };
    } catch (error) {
      logger.error('Shadowing analysis failed:', error);
      throw error;
    }
  }

  /**
   * Upload audio file to Azure Blob Storage
   */
  async uploadAudioFile(audioBuffer: Buffer, userId: string): Promise<string> {
    try {
      if (!this.blobServiceClient) {
        // Save locally for development
        const fileName = `${uuidv4()}.wav`;
        const localPath = path.join(process.cwd(), 'uploads', fileName);

        // Ensure uploads directory exists
        const uploadDir = path.dirname(localPath);
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        fs.writeFileSync(localPath, audioBuffer);
        return localPath;
      }

      const fileName = `${userId}/${uuidv4()}.wav`;
      const containerClient = this.blobServiceClient.getContainerClient(
        this.containerName
      );

      // Ensure container exists
      await containerClient.createIfNotExists();

      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      await blockBlobClient.upload(audioBuffer, audioBuffer.length);

      return blockBlobClient.url;
    } catch (error) {
      logger.error('Audio file upload failed:', error);
      throw error;
    }
  }

  /**
   * Analyze rhythm and timing patterns in speech
   */
  private async analyzeRhythm(audioFilePath: string): Promise<RhythmAnalysis> {
    // This is a simplified rhythm analysis
    // In production, you would use more sophisticated audio processing
    try {
      // For now, return mock rhythm analysis
      // TODO: Implement actual audio processing using FFmpeg or similar
      return {
        tempo: 150, // words per minute
        pauses: [
          { start: 2.5, duration: 0.3, type: 'natural' },
          { start: 5.1, duration: 0.8, type: 'hesitation' },
        ],
        rhythm_score: 75,
      };
    } catch (error) {
      logger.error('Rhythm analysis failed:', error);
      throw error;
    }
  }

  /**
   * Parse word-level pronunciation details
   */
  private parseWordDetails(
    pronunciationResult: sdk.PronunciationAssessmentResult
  ): WordAnalysis[] {
    const wordDetails: WordAnalysis[] = [];

    // Note: The actual implementation would parse the detailed results from Azure Speech Service
    // This is a simplified version for demonstration

    return wordDetails;
  }

  /**
   * Calculate overall pronunciation score
   */
  private calculateOverallScore(
    pronunciationResult: sdk.PronunciationAssessmentResult
  ): number {
    const weights = {
      pronunciation: 0.4,
      accuracy: 0.3,
      fluency: 0.2,
      completeness: 0.1,
    };

    return Math.round(
      (pronunciationResult.pronunciationScore || 0) * weights.pronunciation +
        (pronunciationResult.accuracyScore || 0) * weights.accuracy +
        (pronunciationResult.fluencyScore || 0) * weights.fluency +
        (pronunciationResult.completenessScore || 0) * weights.completeness
    );
  }

  /**
   * Generate feedback based on pronunciation analysis
   */
  private generateFeedback(
    pronunciationResult: sdk.PronunciationAssessmentResult,
    referenceText: string
  ): string[] {
    const feedback: string[] = [];

    if ((pronunciationResult.pronunciationScore || 0) < 70) {
      feedback.push(
        '発音をもう少し明確にしましょう。口の形を意識して発音してみてください。'
      );
    }

    if ((pronunciationResult.fluencyScore || 0) < 70) {
      feedback.push(
        'もう少し流暢に話しましょう。文章全体のリズムを意識してみてください。'
      );
    }

    if ((pronunciationResult.accuracyScore || 0) < 70) {
      feedback.push(
        '単語の正確性を向上させましょう。一つ一つの音を丁寧に発音してみてください。'
      );
    }

    if (feedback.length === 0) {
      feedback.push('素晴らしい発音です！この調子で練習を続けてください。');
    }

    return feedback;
  }

  /**
   * Generate comprehensive shadowing suggestions
   */
  private generateShadowingSuggestions(
    pronunciationAnalysis: SpeechAnalysisResult,
    rhythmAnalysis: RhythmAnalysis,
    referenceText: string
  ): string[] {
    const suggestions: string[] = [];

    // Pronunciation-based suggestions
    if (pronunciationAnalysis.pronunciationScore < 80) {
      suggestions.push(
        '発音練習：母音と子音をより明確に区別して発音しましょう'
      );
    }

    // Rhythm-based suggestions
    if (rhythmAnalysis.rhythm_score < 75) {
      suggestions.push('リズム練習：手本音声のテンポに合わせて練習しましょう');
    }

    // Fluency-based suggestions
    if (pronunciationAnalysis.fluencyScore < 75) {
      suggestions.push(
        '流暢性向上：一気に話すのではなく、自然な間を意識しましょう'
      );
    }

    return suggestions;
  }
  /**
   * Calculate overall shadowing performance score
   */
  private calculateShadowingScore(
    pronunciationAnalysis: SpeechAnalysisResult,
    rhythmAnalysis: RhythmAnalysis
  ): number {
    const weights = {
      pronunciation: 0.5,
      rhythm: 0.3,
      fluency: 0.2,
    };

    return Math.round(
      pronunciationAnalysis.overallScore * weights.pronunciation +
        rhythmAnalysis.rhythm_score * weights.rhythm +
        pronunciationAnalysis.fluencyScore * weights.fluency
    );
  }

  /**
   * Generate mock pronunciation analysis for development
   */
  private getMockPronunciationAnalysis(
    referenceText: string
  ): SpeechAnalysisResult {
    const words = referenceText.split(' ');
    const wordDetails: WordAnalysis[] = words.map((word) => ({
      word,
      accuracyScore: 75 + Math.random() * 20, // Random score between 75-95
      errorType: Math.random() > 0.8 ? 'Mispronunciation' : 'None',
      phonemes: [],
    }));

    const pronunciationScore = 70 + Math.random() * 25;
    const accuracyScore = 75 + Math.random() * 20;
    const fluencyScore = 65 + Math.random() * 30;
    const completenessScore = 80 + Math.random() * 15;

    return {
      transcription: referenceText, // In development, assume perfect transcription
      confidence: 0.85 + Math.random() * 0.1,
      pronunciationScore,
      accuracyScore,
      fluencyScore,
      completenessScore,
      wordDetails,
      overallScore: Math.round(
        (pronunciationScore +
          accuracyScore +
          fluencyScore +
          completenessScore) /
          4
      ),
      feedback: [
        'Mock analysis: Overall pronunciation is good',
        'Practice focusing on clarity of consonants',
        'Try to maintain consistent rhythm',
      ],
    };
  }

  /**
   * Generate mock shadowing analysis for development
   */
  private getMockShadowingAnalysis(
    originalText: string,
    userText: string
  ): ShadowingAnalysis {
    const pronunciationAnalysis =
      this.getMockPronunciationAnalysis(originalText);

    const rhythmAnalysis: RhythmAnalysis = {
      tempo: 150 + Math.random() * 50,
      rhythm_score: 70 + Math.random() * 25,
      pauses: [
        { start: 2.5, duration: 0.5, type: 'natural' },
        { start: 5.2, duration: 0.3, type: 'natural' },
      ],
    };

    return {
      originalText,
      userText: userText || originalText,
      pronunciationAnalysis,
      rhythmAnalysis,
      suggestions: [
        'Try to match the natural pauses in the original audio',
        'Focus on maintaining consistent tempo',
        'Practice difficult words separately',
      ],
      overallScore: this.calculateShadowingScore(
        pronunciationAnalysis,
        rhythmAnalysis
      ),
    };
  }
}

export const speechService = new SpeechService();
