import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Stack,
} from '@mui/material';
import {
  Mic,
  Stop,
  Pause,
  PlayArrow,
  Refresh,
  PlayCircle,
  VolumeUp,
} from '@mui/icons-material';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

interface AudioRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  maxDuration?: number; // in seconds
  disabled?: boolean;
  referenceText?: string;
  showWaveform?: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  maxDuration = 300, // 5 minutes default
  disabled = false,
  referenceText,
  showWaveform = true,
}) => {
  const {
    state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  } = useAudioRecorder();

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackAudio, setPlaybackAudio] = useState<HTMLAudioElement | null>(null);

  // Handle recording completion
  useEffect(() => {
    if (state.audioBlob && onRecordingComplete) {
      onRecordingComplete(state.audioBlob);
    }
  }, [state.audioBlob, onRecordingComplete]);

  // Auto-stop when max duration reached
  useEffect(() => {
    if (state.isRecording && state.duration >= maxDuration) {
      stopRecording();
    }
  }, [state.isRecording, state.duration, maxDuration, stopRecording]);

  // Handle recording start/stop callbacks
  useEffect(() => {
    if (state.isRecording && onRecordingStart) {
      onRecordingStart();
    }
  }, [state.isRecording, onRecordingStart]);

  useEffect(() => {
    if (!state.isRecording && state.duration > 0 && onRecordingStop) {
      onRecordingStop();
    }
  }, [state.isRecording, state.duration, onRecordingStop]);

  const handleStartRecording = async () => {
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handlePauseRecording = () => {
    if (state.isPaused) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  };

  const handleReset = () => {
    if (playbackAudio) {
      playbackAudio.pause();
      setIsPlaying(false);
    }
    resetRecording();
  };

  const handlePlayback = () => {
    if (!state.audioUrl) return;

    if (isPlaying && playbackAudio) {
      playbackAudio.pause();
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(state.audioUrl);
    audio.onended = () => {
      setIsPlaying(false);
      setPlaybackAudio(null);
    };
    audio.onerror = () => {
      setIsPlaying(false);
      setPlaybackAudio(null);
    };

    audio.play();
    setIsPlaying(true);
    setPlaybackAudio(audio);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRecordingStatus = (): string => {
    if (state.isRecording && !state.isPaused) return '録音中...';
    if (state.isPaused) return '一時停止中';
    if (state.audioBlob) return '録音完了';
    return '録音待機中';
  };

  const getStatusColor = (): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
    if (state.isRecording && !state.isPaused) return 'error';
    if (state.isPaused) return 'warning';
    if (state.audioBlob) return 'success';
    return 'default';
  };

  const progressPercentage = Math.min((state.duration / maxDuration) * 100, 100);

  return (
    <Card sx={{ width: '100%', maxWidth: 600 }}>
      <CardContent>
        <Stack spacing={3}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="h3">
              音声録音
            </Typography>
            <Chip 
              label={getRecordingStatus()} 
              color={getStatusColor()}
              variant={state.isRecording ? 'filled' : 'outlined'}
            />
          </Box>

          {/* Reference Text Display */}
          {referenceText && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                参考テキスト:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  p: 2, 
                  bgcolor: 'grey.50', 
                  borderRadius: 1,
                  fontStyle: 'italic'
                }}
              >
                {referenceText}
              </Typography>
            </Box>
          )}

          {/* Error Display */}
          {state.error && (
            <Alert severity="error" onClose={handleReset}>
              {state.error}
            </Alert>
          )}

          {/* Duration and Progress */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                録音時間
              </Typography>
              <Typography variant="body2" fontFamily="monospace">
                {formatDuration(state.duration)} / {formatDuration(maxDuration)}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progressPercentage}
              sx={{ height: 8, borderRadius: 1 }}
              color={progressPercentage > 90 ? 'warning' : 'primary'}
            />
          </Box>

          {/* Waveform Placeholder */}
          {showWaveform && state.isRecording && (
            <Box 
              sx={{ 
                height: 60, 
                bgcolor: 'grey.100', 
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                🎵 音声波形 (今後実装予定)
              </Typography>
            </Box>
          )}

          {/* Control Buttons */}
          <Box display="flex" justifyContent="center" gap={1}>
            {!state.isRecording && !state.audioBlob && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Mic />}
                onClick={handleStartRecording}
                disabled={disabled}
                size="large"
              >
                録音開始
              </Button>
            )}

            {state.isRecording && (
              <>
                <IconButton
                  color="warning"
                  onClick={handlePauseRecording}
                  size="large"
                  disabled={disabled}
                >
                  {state.isPaused ? <PlayArrow /> : <Pause />}
                </IconButton>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Stop />}
                  onClick={handleStopRecording}
                  disabled={disabled}
                >
                  録音停止
                </Button>
              </>
            )}

            {state.audioBlob && (
              <>
                <IconButton
                  color="primary"
                  onClick={handlePlayback}
                  size="large"
                  disabled={disabled}
                >
                  {isPlaying ? <VolumeUp /> : <PlayCircle />}
                </IconButton>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleReset}
                  disabled={disabled}
                >
                  再録音
                </Button>
              </>
            )}
          </Box>

          {/* Recording Info */}
          {state.audioBlob && (
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: 'success.50', 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'success.200'
              }}
            >
              <Typography variant="body2" color="success.dark">
                ✅ 録音が完了しました。再生して確認してください。
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AudioRecorder;
