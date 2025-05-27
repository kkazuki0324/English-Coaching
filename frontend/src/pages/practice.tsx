import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Fab,
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  VolumeUp,
  School,
  Analytics,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import AudioRecorder from '../components/AudioRecorder';
import SpeechAnalysisResults from '../components/SpeechAnalysisResults';
import { speechService, SpeechAnalysisResult, ShadowingAnalysis } from '../services/speechService';

const PracticePage: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<SpeechAnalysisResult | null>(null);
  const [shadowingResult, setShadowingResult] = useState<ShadowingAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlayingReference, setIsPlayingReference] = useState(false);

  // Sample practice material
  const practiceMaterial = {
    id: 'sample-1',
    title: 'Business Meeting Introduction',
    text: "Hello everyone, thank you for joining today's meeting. I'd like to start by introducing our new team member, Sarah Johnson, who will be leading our marketing initiatives for the upcoming quarter.",
    audioUrl: null, // In real app, this would be a reference audio URL
    difficulty: 'intermediate',
    category: 'Business English',
  };

  const steps = [
    '素材を確認',
    '手本を聞く',
    '録音練習',
    '分析結果',
  ];

  const handleRecordingComplete = useCallback(async (audioBlob: Blob) => {
    setError(null);
    setIsAnalyzing(true);

    try {
      // Perform shadowing analysis
      const result = await speechService.analyzeShadowing(
        audioBlob,
        practiceMaterial.text,
        practiceMaterial.id
      );

      setShadowingResult(result);
      setCurrentStep(3); // Move to results step
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [practiceMaterial.text, practiceMaterial.id]);

  const handlePlayReference = async () => {
    if (isPlayingReference) return;

    try {
      setIsPlayingReference(true);
      
      // Generate reference audio using TTS
      const ttsResult = await speechService.textToSpeech({
        text: practiceMaterial.text,
        voice: 'en-US-JennyNeural',
        speed: 1.0,
      });

      // Play the generated audio
      const audio = new Audio(ttsResult.audioUrl);
      audio.onended = () => setIsPlayingReference(false);
      audio.onerror = () => setIsPlayingReference(false);
      await audio.play();
    } catch (err) {
      console.error('Failed to play reference audio:', err);
      setError('音声の再生に失敗しました');
      setIsPlayingReference(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRetry = () => {
    setAnalysisResult(null);
    setShadowingResult(null);
    setError(null);
    setCurrentStep(2); // Go back to recording step
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Material Overview
        return (
          <Card>
            <CardContent>
              <Box textAlign="center" py={4}>
                <School color="primary" sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  {practiceMaterial.title}
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {practiceMaterial.category} • {practiceMaterial.difficulty}
                </Typography>
                <Box 
                  sx={{ 
                    p: 3, 
                    mt: 3,
                    bgcolor: 'grey.50', 
                    borderRadius: 2,
                    maxWidth: 600,
                    mx: 'auto'
                  }}
                >
                  <Typography variant="body1" lineHeight={1.8}>
                    {practiceMaterial.text}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleNextStep}
                  sx={{ mt: 3 }}
                >
                  練習を開始
                </Button>
              </Box>
            </CardContent>
          </Card>
        );

      case 1: // Listen to Reference
        return (
          <Card>
            <CardContent>
              <Box textAlign="center" py={4}>
                <VolumeUp color="primary" sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  手本音声を聞きましょう
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  まずは手本の音声を注意深く聞いて、発音・リズム・イントネーションを確認しましょう
                </Typography>
                
                <Box 
                  sx={{ 
                    p: 3, 
                    mt: 3,
                    bgcolor: 'primary.50', 
                    borderRadius: 2,
                    maxWidth: 600,
                    mx: 'auto'
                  }}
                >
                  <Typography variant="body1" lineHeight={1.8}>
                    {practiceMaterial.text}
                  </Typography>
                </Box>

                <Box sx={{ mt: 4, mb: 3 }}>
                  <Fab
                    color="primary"
                    size="large"
                    onClick={handlePlayReference}
                    disabled={isPlayingReference}
                    sx={{ mr: 2 }}
                  >
                    <PlayArrow />
                  </Fab>
                  <Typography variant="body2" color="text.secondary">
                    {isPlayingReference ? '再生中...' : '音声を再生'}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  onClick={handleNextStep}
                  disabled={isPlayingReference}
                >
                  録音に進む
                </Button>
              </Box>
            </CardContent>
          </Card>
        );

      case 2: // Recording Practice
        return (
          <Box>
            <Box textAlign="center" mb={4}>
              <Typography variant="h5" gutterBottom>
                シャドーイング練習
              </Typography>
              <Typography variant="body1" color="text.secondary">
                手本に合わせて発話してください。録音ボタンを押して開始しましょう。
              </Typography>
            </Box>
            
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              referenceText={practiceMaterial.text}
              maxDuration={120} // 2 minutes
              disabled={isAnalyzing}
            />

            {isAnalyzing && (
              <Box mt={3}>
                <Alert severity="info">
                  音声を分析中です。しばらくお待ちください...
                </Alert>
              </Box>
            )}
          </Box>
        );

      case 3: // Analysis Results
        return (
          <Box>
            <Box textAlign="center" mb={4}>
              <Analytics color="primary" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                分析結果
              </Typography>
              <Typography variant="body1" color="text.secondary">
                あなたの発話を詳細に分析しました
              </Typography>
            </Box>

            <SpeechAnalysisResults
              shadowingResult={shadowingResult || undefined}
              loading={isAnalyzing}
              error={error || undefined}
            />

            {shadowingResult && (
              <Box textAlign="center" mt={4}>
                <Button
                  variant="outlined"
                  onClick={handleRetry}
                  sx={{ mr: 2 }}
                >
                  もう一度練習
                </Button>
                <Button
                  variant="contained"
                  onClick={() => router.push('/')}
                >
                  ホームに戻る
                </Button>
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>シャドーイング練習 - English Coaching</title>
        <meta name="description" content="AI音声分析によるシャドーイング練習" />
      </Head>

      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.push('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            シャドーイング練習
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Progress Stepper */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Step Content */}
        <Box>{renderStepContent()}</Box>

        {/* Navigation */}
        {currentStep > 0 && currentStep < 3 && (
          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button
              variant="outlined"
              onClick={handlePrevStep}
              disabled={isAnalyzing}
            >
              戻る
            </Button>
            {currentStep < 2 && (
              <Button
                variant="contained"
                onClick={handleNextStep}
                disabled={isAnalyzing}
              >
                次へ
              </Button>
            )}
          </Box>
        )}
      </Container>
    </>
  );
};

export default PracticePage;
