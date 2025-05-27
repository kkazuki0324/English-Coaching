import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
  res.json({
    message: 'English Coaching API - Minimal Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Simple speech analysis mock endpoint
app.post('/api/speech/analyze-pronunciation', (req, res) => {
  res.json({
    success: true,
    data: {
      overallScore: 85,
      transcription: 'This is a test transcription',
      detailedAnalysis: {
        words: [],
        phonemes: [],
      },
    },
    metadata: {
      processingTime: Date.now(),
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
