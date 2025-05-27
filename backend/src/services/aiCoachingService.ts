import { OpenAI } from 'openai';
import { logger } from '../utils/logger';
import { SpeechAnalysisResult, ShadowingAnalysis } from './speechService';

export interface CoachingRequest {
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  learningGoals: string[];
  analysisHistory: SpeechAnalysisResult[];
  currentAnalysis?: SpeechAnalysisResult | ShadowingAnalysis;
  userQuestion?: string;
  context?: string;
}

export interface CoachingResponse {
  message: string;
  suggestions: string[];
  exercises: Exercise[];
  nextSteps: string[];
  motivationalMessage: string;
}

export interface Exercise {
  type: 'pronunciation' | 'rhythm' | 'fluency' | 'vocabulary';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // in minutes
  instructions: string[];
}

class AICoachingService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;

    if (!apiKey || !endpoint) {
      logger.warn(
        'Azure OpenAI credentials not configured - coaching service will use mock responses'
      );
      this.openai = null as any;
    } else {
      this.openai = new OpenAI({
        apiKey,
        baseURL: `${endpoint}/openai/deployments/gpt-4/`,
        defaultQuery: { 'api-version': '2024-02-01' },
        defaultHeaders: {
          'api-key': apiKey,
        },
      });
    }
  }

  /**
   * Get personalized coaching advice based on analysis results
   */
  async getCoachingAdvice(request: CoachingRequest): Promise<CoachingResponse> {
    if (!this.openai) {
      return this.getMockCoachingResponse(request);
    }

    try {
      const systemPrompt = this.createSystemPrompt();
      const userPrompt = this.createUserPrompt(request);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI coach');
      }

      return this.parseCoachingResponse(response);
    } catch (error) {
      logger.error('AI coaching service failed:', error);
      return this.getMockCoachingResponse(request);
    }
  }

  /**
   * Get quick feedback on specific aspects of pronunciation
   */
  async getQuickFeedback(
    analysisResult: SpeechAnalysisResult,
    focusArea: 'pronunciation' | 'fluency' | 'rhythm' | 'overall'
  ): Promise<string> {
    if (!this.openai) {
      return this.getMockQuickFeedback(analysisResult, focusArea);
    }

    try {
      const prompt = this.createQuickFeedbackPrompt(analysisResult, focusArea);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert English pronunciation coach. Provide concise, actionable feedback in Japanese.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 300,
      });

      return (
        completion.choices[0]?.message?.content ||
        this.getMockQuickFeedback(analysisResult, focusArea)
      );
    } catch (error) {
      logger.error('Quick feedback generation failed:', error);
      return this.getMockQuickFeedback(analysisResult, focusArea);
    }
  }

  /**
   * Generate personalized practice exercises
   */
  async generateExercises(
    userLevel: string,
    weakAreas: string[],
    timeAvailable: number
  ): Promise<Exercise[]> {
    if (!this.openai) {
      return this.getMockExercises(userLevel, weakAreas, timeAvailable);
    }

    try {
      const prompt = `
Generate personalized English speaking exercises for a ${userLevel} level learner.
Weak areas to focus on: ${weakAreas.join(', ')}
Available time: ${timeAvailable} minutes

Please provide 3-5 exercises in JSON format with the following structure:
{
  "type": "pronunciation|rhythm|fluency|vocabulary",
  "title": "Exercise title",
  "description": "Brief description",
  "difficulty": "easy|medium|hard",
  "estimatedTime": number,
  "instructions": ["step 1", "step 2", ...]
}
`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an English speaking coach. Respond only with valid JSON array of exercises.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        const exercises = JSON.parse(response);
        return Array.isArray(exercises)
          ? exercises
          : this.getMockExercises(userLevel, weakAreas, timeAvailable);
      }
    } catch (error) {
      logger.error('Exercise generation failed:', error);
    }

    return this.getMockExercises(userLevel, weakAreas, timeAvailable);
  }

  private createSystemPrompt(): string {
    return `
You are an expert English speaking coach with years of experience helping Japanese learners improve their pronunciation, fluency, and overall speaking skills.

Your role is to:
1. Analyze speech analysis results and provide constructive feedback
2. Create personalized learning recommendations
3. Motivate learners with encouraging but realistic advice
4. Provide specific, actionable suggestions for improvement
5. Adapt your communication style to the learner's level

Always respond in Japanese as you're helping Japanese learners.
Be encouraging but honest about areas that need improvement.
Focus on practical, achievable steps the learner can take immediately.
`;
  }

  private createUserPrompt(request: CoachingRequest): string {
    const { userLevel, learningGoals, currentAnalysis, userQuestion } = request;

    let prompt = `
学習者レベル: ${userLevel}
学習目標: ${learningGoals.join(', ')}

`;

    if (currentAnalysis) {
      if ('pronunciationAnalysis' in currentAnalysis) {
        // Shadowing analysis
        const analysis = currentAnalysis as ShadowingAnalysis;
        prompt += `
シャドーイング分析結果:
- 総合スコア: ${analysis.overallScore}点
- 発音分析: ${analysis.pronunciationAnalysis.overallScore}点
- リズム分析: ${analysis.rhythmAnalysis.rhythm_score}点
- 元テキスト: "${analysis.originalText}"
- 認識テキスト: "${analysis.userText}"
`;
      } else {
        // Pronunciation analysis
        const analysis = currentAnalysis as SpeechAnalysisResult;
        prompt += `
発音分析結果:
- 総合スコア: ${analysis.overallScore}点
- 発音精度: ${analysis.pronunciationScore}点
- 正確性: ${analysis.accuracyScore}点
- 流暢性: ${analysis.fluencyScore}点
- 完成度: ${analysis.completenessScore}点
- 認識テキスト: "${analysis.transcription}"
`;
      }
    }

    if (userQuestion) {
      prompt += `\n学習者からの質問: "${userQuestion}"`;
    }

    prompt += `
この分析結果に基づいて、学習者へのコーチングアドバイスを以下の形式で提供してください：

1. 総合的なフィードバックメッセージ
2. 具体的な改善提案（3-5個）
3. 推奨練習方法（2-3個）
4. 次のステップ（1-2個）
5. 励ましのメッセージ

回答は実用的で実行可能な内容にしてください。
`;

    return prompt;
  }

  private createQuickFeedbackPrompt(
    analysisResult: SpeechAnalysisResult,
    focusArea: string
  ): string {
    return `
発音分析結果:
- 発音精度: ${analysisResult.pronunciationScore}点
- 正確性: ${analysisResult.accuracyScore}点
- 流暢性: ${analysisResult.fluencyScore}点
- 認識テキスト: "${analysisResult.transcription}"

焦点エリア: ${focusArea}

この${focusArea}に関して、簡潔で実用的なフィードバックを50文字以内で提供してください。
具体的な改善アクションを含めてください。
`;
  }

  private parseCoachingResponse(response: string): CoachingResponse {
    // This would implement parsing of the AI response
    // For now, return a structured mock response
    return {
      message: response.substring(0, 200) + '...',
      suggestions: [
        '発音をよりクリアにするため、母音を長めに発音してみましょう',
        'リズムを改善するため、文の区切りで適切な間を取りましょう',
        '流暢性向上のため、毎日10分間の音読練習を続けましょう',
      ],
      exercises: [],
      nextSteps: [
        '今回の弱点を重点的に練習する',
        '次回はより難しい教材にチャレンジする',
      ],
      motivationalMessage: '着実に上達しています！継続は力なりです。',
    };
  }

  private getMockCoachingResponse(request: CoachingRequest): CoachingResponse {
    const { currentAnalysis, userLevel } = request;
    let score = 75;
    if (currentAnalysis) {
      if ('overallScore' in currentAnalysis) {
        score = currentAnalysis.overallScore;
      } else if ('pronunciationAnalysis' in currentAnalysis) {
        score = (currentAnalysis as any).pronunciationAnalysis.overallScore;
      }
    }

    return {
      message: `${score}点という素晴らしい結果です！${userLevel}レベルとしては非常に良好な発音です。特に流暢性の面で改善が見られます。`,
      suggestions: [
        '単語の境界をより明確にするため、子音を強調して発音してみましょう',
        'リズムパターンを意識して、強勢のある音節を長めに発音しましょう',
        '自然な間の取り方を練習するため、意味のかたまりで区切って読んでみましょう',
      ],
      exercises: [
        {
          type: 'pronunciation',
          title: '子音強化練習',
          description: 'p, b, t, d の音を明確に区別する練習',
          difficulty: 'medium',
          estimatedTime: 10,
          instructions: [
            'それぞれの音を単独で5回繰り返す',
            'ペアで比較練習（pat - bat, tip - dip）',
            '文章中での使い分け練習',
          ],
        },
      ],
      nextSteps: [
        '弱点の子音発音を重点的に練習する',
        'より長い文章でのシャドーイング練習に進む',
      ],
      motivationalMessage:
        'とても良い進歩です！この調子で練習を続ければ、必ず目標に到達できます。',
    };
  }

  private getMockQuickFeedback(
    analysisResult: SpeechAnalysisResult,
    focusArea: string
  ): string {
    const score = analysisResult.overallScore;

    if (score >= 80) {
      return '素晴らしい発音です！この調子で継続しましょう。';
    } else if (score >= 60) {
      return '良い発音です。子音をもう少し明確にするとさらに向上します。';
    } else {
      return '発音の基礎練習を重点的に行いましょう。毎日少しずつでも継続が大切です。';
    }
  }

  private getMockExercises(
    userLevel: string,
    weakAreas: string[],
    timeAvailable: number
  ): Exercise[] {
    return [
      {
        type: 'pronunciation',
        title: '母音発音練習',
        description: '日本人が苦手な英語母音の区別練習',
        difficulty: userLevel === 'beginner' ? 'easy' : 'medium',
        estimatedTime: Math.min(15, timeAvailable),
        instructions: [
          'ミラーで口の形を確認しながら練習',
          'a, e, i, o, u を正確に発音',
          '単語レベルでの練習（bat, bet, bit, bot, but）',
        ],
      },
      {
        type: 'rhythm',
        title: 'リズム練習',
        description: '英語の自然なリズムパターンの習得',
        difficulty: 'medium',
        estimatedTime: Math.min(10, timeAvailable),
        instructions: [
          'メトロノームに合わせて練習',
          '強勢のあるシラブルを意識',
          '短い文から長い文へと段階的に練習',
        ],
      },
    ];
  }
}

export const aiCoachingService = new AICoachingService();
