import { Router, Request, Response } from 'express';
import multer from 'multer';
import {
  speechService,
  ShadowingAnalysis,
  SpeechAnalysisResult,
} from '../services/speechService';
import { logger } from '../utils/logger';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (
      file.mimetype.startsWith('audio/') ||
      file.originalname.endsWith('.wav') ||
      file.originalname.endsWith('.mp3')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

/**
 * POST /api/speech/analyze-pronunciation
 * Analyze pronunciation of uploaded audio against reference text
 */
router.post(
  '/analyze-pronunciation',
  authenticateToken,
  upload.single('audio'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'Audio file is required',
          code: 'MISSING_AUDIO_FILE',
        });
      }

      const { referenceText } = req.body;
      if (!referenceText) {
        return res.status(400).json({
          error: 'Reference text is required',
          code: 'MISSING_REFERENCE_TEXT',
        });
      }

      const userId = req.user?.id || 'anonymous';

      // Upload audio file
      const audioPath = await speechService.uploadAudioFile(
        req.file.buffer,
        userId
      );

      // Analyze pronunciation
      const analysis: SpeechAnalysisResult =
        await speechService.analyzePronunciation(audioPath, referenceText);
      logger.info(`Pronunciation analysis completed for user ${userId}`, {
        userId,
        score: analysis.overallScore,
        transcription: analysis.transcription,
      });

      return res.json({
        success: true,
        data: analysis,
        metadata: {
          audioPath,
          processingTime: Date.now(),
          userId,
        },
      });
    } catch (error) {
      logger.error('Pronunciation analysis failed:', error);
      return res.status(500).json({
        error: 'Failed to analyze pronunciation',
        code: 'ANALYSIS_FAILED',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * POST /api/speech/analyze-shadowing
 * Perform comprehensive shadowing analysis
 */
router.post(
  '/analyze-shadowing',
  authenticateToken,
  upload.single('audio'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'Audio file is required',
          code: 'MISSING_AUDIO_FILE',
        });
      }

      const { referenceText, materialId } = req.body;
      if (!referenceText) {
        return res.status(400).json({
          error: 'Reference text is required',
          code: 'MISSING_REFERENCE_TEXT',
        });
      }

      const userId = req.user?.id || 'anonymous';

      // Upload audio file
      const audioPath = await speechService.uploadAudioFile(
        req.file.buffer,
        userId
      );

      // Perform shadowing analysis
      const analysis: ShadowingAnalysis = await speechService.analyzeShadowing(
        audioPath,
        referenceText
      );
      logger.info(`Shadowing analysis completed for user ${userId}`, {
        userId,
        materialId,
        overallScore: analysis.overallScore,
        suggestionsCount: analysis.suggestions.length,
      });

      return res.json({
        success: true,
        data: analysis,
        metadata: {
          audioPath,
          materialId,
          processingTime: Date.now(),
          userId,
        },
      });
    } catch (error) {
      logger.error('Shadowing analysis failed:', error);
      return res.status(500).json({
        error: 'Failed to analyze shadowing',
        code: 'ANALYSIS_FAILED',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * GET /api/speech/supported-languages
 * Get list of supported languages for speech recognition
 */
router.get('/supported-languages', (req: Request, res: Response) => {
  const supportedLanguages = [
    {
      code: 'en-US',
      name: 'English (United States)',
      default: true,
    },
    {
      code: 'en-GB',
      name: 'English (United Kingdom)',
      default: false,
    },
    {
      code: 'en-AU',
      name: 'English (Australia)',
      default: false,
    },
  ];

  res.json({
    success: true,
    data: supportedLanguages,
  });
});

/**
 * POST /api/speech/text-to-speech
 * Generate audio from text using Azure Speech Service
 */
router.post(
  '/text-to-speech',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { text, voice = 'en-US-JennyNeural', speed = 1.0 } = req.body;

      if (!text) {
        return res.status(400).json({
          error: 'Text is required',
          code: 'MISSING_TEXT',
        });
      }

      if (text.length > 1000) {
        return res.status(400).json({
          error: 'Text is too long (max 1000 characters)',
          code: 'TEXT_TOO_LONG',
        });
      }

      // TODO: Implement text-to-speech using Azure Speech Service
      // For now, return a mock response
      const audioUrl = `https://example.com/tts/${Date.now()}.wav`;
      logger.info(`Text-to-speech generated for user ${req.user?.id}`, {
        textLength: text.length,
        voice,
        speed,
      });

      return res.json({
        success: true,
        data: {
          audioUrl,
          text,
          voice,
          speed,
          duration: Math.ceil(text.length / 10), // Mock duration calculation
        },
      });
    } catch (error) {
      logger.error('Text-to-speech generation failed:', error);
      return res.status(500).json({
        error: 'Failed to generate speech',
        code: 'TTS_FAILED',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * GET /api/speech/voices
 * Get available voices for text-to-speech
 */
router.get('/voices', (req: Request, res: Response) => {
  const availableVoices = [
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
    {
      name: 'en-GB-RyanNeural',
      displayName: 'Ryan (UK Male)',
      gender: 'Male',
      locale: 'en-GB',
      recommended: false,
    },
  ];

  res.json({
    success: true,
    data: availableVoices,
  });
});

/**
 * POST /api/speech/test-pronunciation
 * Test pronunciation analysis endpoint (no auth required for development)
 */
router.post('/test-pronunciation', async (req: Request, res: Response) => {
  try {
    const { referenceText } = req.body;

    if (!referenceText) {
      return res.status(400).json({
        error: 'Reference text is required',
        code: 'MISSING_TEXT',
      });
    }

    // Use mock audio file path for testing
    const mockAudioPath = 'mock-audio.wav';

    logger.info('Test pronunciation analysis started', {
      referenceText: referenceText.substring(0, 50),
    });

    const analysis = await speechService.analyzePronunciation(
      mockAudioPath,
      referenceText
    );

    logger.info('Test pronunciation analysis completed', {
      score: analysis.overallScore,
      transcription: analysis.transcription,
    });

    return res.json({
      success: true,
      data: analysis,
      metadata: {
        mode: 'test',
        processingTime: Date.now(),
      },
    });
  } catch (error) {
    logger.error('Test pronunciation analysis failed:', error);
    return res.status(500).json({
      error: 'Failed to analyze pronunciation',
      code: 'ANALYSIS_FAILED',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export { router as speechRouter };
