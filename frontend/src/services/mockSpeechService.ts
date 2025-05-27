// モック用のスピーチ分析サービス
import {
  SpeechAnalysisResult,
  ShadowingAnalysis,
  Voice,
  SupportedLanguage,
} from './speechService';

class MockSpeechService {
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  /**
   * モック：発音分析
   */
  async analyzePronunciation(
    audioBlob: Blob,
    referenceText: string
  ): Promise<SpeechAnalysisResult> {
    // 開発中はモックデータを返す
    await this.simulateDelay(2000); // 2秒の擬似処理時間

    const mockResult: SpeechAnalysisResult = {
      transcription: referenceText.slice(
        0,
        Math.floor(referenceText.length * 0.9)
      ), // 90%の精度をシミュレート
      confidence: 0.85,
      pronunciationScore: Math.floor(Math.random() * 30) + 70, // 70-100のランダムスコア
      accuracyScore: Math.floor(Math.random() * 25) + 75,
      fluencyScore: Math.floor(Math.random() * 35) + 65,
      completenessScore: Math.floor(Math.random() * 20) + 80,
      wordDetails: [],
      overallScore: Math.floor(Math.random() * 25) + 75,
      feedback: [
        '発音が明確で良好です。',
        'リズムを少し意識してみましょう。',
        '全体的に良いパフォーマンスです。',
      ],
    };

    return mockResult;
  }

  /**
   * モック：シャドーイング分析
   */
  async analyzeShadowing(
    audioBlob: Blob,
    referenceText: string,
    materialId?: string
  ): Promise<ShadowingAnalysis> {
    await this.simulateDelay(3000); // 3秒の擬似処理時間

    const pronunciationAnalysis = await this.analyzePronunciation(
      audioBlob,
      referenceText
    );

    const mockResult: ShadowingAnalysis = {
      originalText: referenceText,
      userText: pronunciationAnalysis.transcription,
      pronunciationAnalysis,
      rhythmAnalysis: {
        tempo: Math.floor(Math.random() * 50) + 120, // 120-170 WPM
        pauses: [
          { start: 2.5, duration: 0.3, type: 'natural' },
          { start: 5.1, duration: 0.8, type: 'hesitation' },
        ],
        rhythm_score: Math.floor(Math.random() * 30) + 70,
      },
      suggestions: [
        '発音練習：母音をより明確に発音してみましょう。',
        'リズム改善：自然な間を意識して話してみてください。',
        '流暢性向上：文章全体の流れを意識しましょう。',
      ],
      overallScore: Math.floor(Math.random() * 25) + 75,
    };

    return mockResult;
  }

  /**
   * モック：対応言語取得
   */
  async getSupportedLanguages(): Promise<SupportedLanguage[]> {
    return [
      { code: 'en-US', name: 'English (United States)', default: true },
      { code: 'en-GB', name: 'English (United Kingdom)', default: false },
      { code: 'en-AU', name: 'English (Australia)', default: false },
    ];
  }

  /**
   * モック：音声合成
   */
  async textToSpeech(
    text: string,
    voice: string = 'en-US-JennyNeural',
    speed: number = 1.0
  ): Promise<{ audioUrl: string; duration: number }> {
    await this.simulateDelay(1500);

    return {
      audioUrl: `data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBz2U2fDJdSgELnjA8dyJOAgUXrTp66hVFApGn+DyvmEcBz2U2fDJdSgELn`, // モック音声データ
      duration: Math.ceil(text.length / 10), // 1文字0.1秒として計算
    };
  }

  /**
   * モック：利用可能な音声一覧
   */
  async getAvailableVoices(): Promise<Voice[]> {
    return [
      {
        name: 'en-US-JennyNeural',
        displayName: 'Jenny (US Female)',
        gender: 'Female',
        locale: 'en-US',
        recommended: true,
      },
      {
        name: 'en-US-GuyNeural',
        displayName: 'Guy (US Male)',
        gender: 'Male',
        locale: 'en-US',
        recommended: true,
      },
      {
        name: 'en-GB-LibbyNeural',
        displayName: 'Libby (UK Female)',
        gender: 'Female',
        locale: 'en-GB',
        recommended: false,
      },
    ];
  }

  /**
   * 擬似的な処理時間をシミュレート
   */
  private simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * API接続テスト
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/health`);
      return response.ok;
    } catch (error) {
      console.warn('API connection failed, using mock data:', error);
      return false;
    }
  }
}

export const mockSpeechService = new MockSpeechService();
