const express = require('express');
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');
const app = express();

const PORT = 443;

//https stuff
const options = {
  key: fs.readFileSync("C:/win-acme/matyashensel.com-key.pem"),
  cert: fs.readFileSync("C:/win-acme/matyashensel.com-chain.pem")
};

https.createServer(options, app).listen(PORT, '0.0.0.0', () => {
  console.log("✅ HTTPS server running on port 443");
});



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


http.createServer((req, res) => {
  const host = req.headers.host.replace(/:\d+$/, ''); // remove port
  res.writeHead(301, { Location: `https://${host}${req.url}` });
  res.end();
}).listen(80, '0.0.0.0', () => {
  console.log("🔁 HTTP redirect server running on port 80");
});

console.log('backendServerRunning');