const express = require('express');
const path = require('path');
const app = express();
const PORT = 8080;

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.ip} requested ${req.method} ${req.url} Host: ${req.headers.host}`);
  next();
});

app.use((req, res, next) => {
  if (req.path.startsWith('/.')) {
    return res.status(403).send('Access denied');
  }
  next();
});

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url} from ${req.ip}`);
  next(); // pass control to the next middleware/handler
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  try {
    console.log('Request Host:', req.headers.host);
    res.send(`<h1>Hello from ${req.headers.host || 'unknown host'}</h1>`);
  } catch (e) {
    console.error('Error handling request:', e);
    res.status(500).send('Server error');
  }
});

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

server.on("error", (err) => {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
});

console.log('backendServerRunning');