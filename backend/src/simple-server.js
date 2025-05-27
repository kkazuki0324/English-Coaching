const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS設定
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

// JSONパーサー
app.use(express.json());

// 基本的なルート
app.get('/', (req, res) => {
  res.json({
    message: 'English Coaching API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 English Coaching API server running on port ${PORT}`);
  console.log(`📝 Environment: development`);
  console.log(`🌐 CORS origin: http://localhost:3000`);
});

module.exports = app;
