console.log('🚀 Starting Express server...');

const express = require('express');
const app = express();
const PORT = 3001;

app.get('/', (req, res) => {
  console.log('📥 Request received at /');
  res.json({
    message: 'Hello from Express!',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  console.log('📥 Health check request');
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log('📝 Available routes:');
  console.log('   GET / - Basic info');
  console.log('   GET /api/health - Health check');
});

console.log('🔧 Express app setup complete.');
