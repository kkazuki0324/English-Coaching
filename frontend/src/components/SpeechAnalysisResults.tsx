import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Grid,
  Collapse,
  IconButton,
  Alert,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Warning,
  Error,
  TrendingUp,
  Feedback,
  RecordVoiceOver,
  Speed,
  Psychology,
} from '@mui/icons-material';
import { SpeechAnalysisResult, ShadowingAnalysis, WordAnalysis } from '../services/speechService';

interface SpeechAnalysisResultsProps {
  analysisResult?: SpeechAnalysisResult;
  shadowingResult?: ShadowingAnalysis;
  loading?: boolean;
  error?: string;
}

const SpeechAnalysisResults: React.FC<SpeechAnalysisResultsProps> = ({
  analysisResult,
  shadowingResult,
  loading = false,
  error,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overall: true,
    detailed: false,
    feedback: true,
    rhythm: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getScoreColor = (score: number): 'error' | 'warning' | 'success' => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle color="success" />;
    if (score >= 60) return <Warning color="warning" />;
    return <Error color="error" />;
  };

  const formatScore = (score: number): string => {
    return `${Math.round(score)}点`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <RecordVoiceOver color="primary" />
            <Typography variant="h6">音声を分析中...</Typography>
          </Box>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" mt={1}>
            分析には数秒かかる場合があります
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        <Typography variant="h6" gutterBottom>分析エラー</Typography>
        {error}
      </Alert>
    );
  }

  if (!analysisResult && !shadowingResult) {
    return null;
  }

  const result = shadowingResult?.pronunciationAnalysis || analysisResult;
  if (!result) return null;

  return (
    <Stack spacing={3}>
      {/* Overall Score Card */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" display="flex" alignItems="center" gap={1}>
              <TrendingUp color="primary" />
              総合スコア
            </Typography>
            <IconButton onClick={() => toggleSection('overall')}>
              {expandedSections.overall ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          <Collapse in={expandedSections.overall}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box textAlign="center">
                  <Typography variant="h2" color={getScoreColor(result.overallScore)}>
                    {formatScore(result.overallScore)}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    総合評価
                  </Typography>
                  {getScoreIcon(result.overallScore)}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      発音精度 ({formatScore(result.pronunciationScore)})
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={result.pronunciationScore}
                      color={getScoreColor(result.pronunciationScore)}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      正確性 ({formatScore(result.accuracyScore)})
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={result.accuracyScore}
                      color={getScoreColor(result.accuracyScore)}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      流暢性 ({formatScore(result.fluencyScore)})
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={result.fluencyScore}
                      color={getScoreColor(result.fluencyScore)}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      完成度 ({formatScore(result.completenessScore)})
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={result.completenessScore}
                      color={getScoreColor(result.completenessScore)}
                    />
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>

      {/* Transcription and Comparison */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
            <RecordVoiceOver color="primary" />
            音声認識結果
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body1">
              {result.transcription || '音声が認識されませんでした'}
            </Typography>
          </Box>
          {shadowingResult && (
            <>
              <Typography variant="subtitle2" color="text.secondary" mt={2} mb={1}>
                元のテキスト:
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                <Typography variant="body1">
                  {shadowingResult.originalText}
                </Typography>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Rhythm Analysis (for shadowing) */}
      {shadowingResult?.rhythmAnalysis && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" display="flex" alignItems="center" gap={1}>
                <Speed color="primary" />
                リズム分析
              </Typography>
              <IconButton onClick={() => toggleSection('rhythm')}>
                {expandedSections.rhythm ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>

            <Collapse in={expandedSections.rhythm}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    発話速度
                  </Typography>
                  <Typography variant="h6">
                    {shadowingResult.rhythmAnalysis.tempo} WPM
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    リズムスコア
                  </Typography>
                  <Typography variant="h6" color={getScoreColor(shadowingResult.rhythmAnalysis.rhythm_score)}>
                    {formatScore(shadowingResult.rhythmAnalysis.rhythm_score)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    間の分析
                  </Typography>
                  {shadowingResult.rhythmAnalysis.pauses.length > 0 ? (
                    <Stack spacing={1}>
                      {shadowingResult.rhythmAnalysis.pauses.map((pause, index) => (
                        <Chip
                          key={index}
                          label={`${pause.start.toFixed(1)}s: ${pause.duration.toFixed(1)}s間 (${pause.type})`}
                          size="small"
                          color={pause.type === 'natural' ? 'success' : pause.type === 'hesitation' ? 'warning' : 'error'}
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      特記すべき間は検出されませんでした
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Collapse>
          </CardContent>
        </Card>
      )}

      {/* Detailed Word Analysis */}
      {result.wordDetails && result.wordDetails.length > 0 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" display="flex" alignItems="center" gap={1}>
                <Psychology color="primary" />
                単語別詳細分析
              </Typography>
              <IconButton onClick={() => toggleSection('detailed')}>
                {expandedSections.detailed ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>

            <Collapse in={expandedSections.detailed}>
              <Grid container spacing={1}>
                {result.wordDetails.map((word, index) => (
                  <Grid item key={index}>
                    <Chip
                      label={`${word.word} (${formatScore(word.accuracyScore)})`}
                      color={getScoreColor(word.accuracyScore)}
                      variant={word.errorType !== 'None' ? 'filled' : 'outlined'}
                    />
                  </Grid>
                ))}
              </Grid>
            </Collapse>
          </CardContent>
        </Card>
      )}

      {/* Feedback and Suggestions */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" display="flex" alignItems="center" gap={1}>
              <Feedback color="primary" />
              フィードバックと改善提案
            </Typography>
            <IconButton onClick={() => toggleSection('feedback')}>
              {expandedSections.feedback ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          <Collapse in={expandedSections.feedback}>
            <Stack spacing={2}>
              {/* General Feedback */}
              {result.feedback && result.feedback.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    発音フィードバック:
                  </Typography>
                  <List dense>
                    {result.feedback.map((feedback, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Feedback color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={feedback} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Shadowing Suggestions */}
              {shadowingResult?.suggestions && shadowingResult.suggestions.length > 0 && (
                <Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    シャドーイング改善提案:
                  </Typography>
                  <List dense>
                    {shadowingResult.suggestions.map((suggestion, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <TrendingUp color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={suggestion} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Stack>
          </Collapse>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default SpeechAnalysisResults;
