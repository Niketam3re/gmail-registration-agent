const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send(`
    <h1>🎉 Gmail Agent Registration System</h1>
    <p>Status: ✅ Running Successfully!</p>
    <p>Port: ${PORT}</p>
    <hr>
    <a href="/health">Check Health Status</a>
  `);
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
