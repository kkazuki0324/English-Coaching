console.log('Starting simple server...');

const express = require('express');
const cors = require('cors');

console.log('Express imported');

const app = express();
const PORT = 3001;

console.log('Express app created');

// Basic middleware
app.use(cors());
app.use(express.json());

console.log('Middleware configured');

// Routes
app.get('/', (req, res) => {
  console.log('Root route hit');
  res.json({ message: 'Server is working!' });
});

app.get('/api/health', (req, res) => {
  console.log('Health check route hit');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

console.log('Routes configured');

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server successfully started on port ${PORT}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

console.log('Server listen call completed');
