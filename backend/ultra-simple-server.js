console.log('=== SERVER STARTUP LOG ===');

try {
  console.log('1. Loading Express...');
  const express = require('express');
  console.log('✓ Express loaded successfully');

  console.log('2. Creating app...');
  const app = express();
  console.log('✓ App created successfully');

  console.log('3. Setting up basic route...');
  app.get('/', (req, res) => {
    console.log('📥 Root route accessed');
    res.json({
      message: 'Hello from English Coaching API!',
      timestamp: new Date().toISOString(),
      status: 'working',
    });
  });
  console.log('✓ Route configured successfully');

  console.log('4. Starting server on port 3001...');
  const server = app.listen(3001, () => {
    console.log('🎉 SUCCESS! Server is running on http://localhost:3001');
    console.log('🔗 Try accessing: http://localhost:3001 in your browser');
  });

  server.on('error', (error) => {
    console.error('❌ Server error:', error);
  });
} catch (error) {
  console.error('💥 Fatal error during startup:', error);
}
