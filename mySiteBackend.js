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


/*
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.ip} requested ${req.method} ${req.url} Host: ${req.headers.host}`);
  next();
});
*/

app.use((req, res, next) => {
  if (req.path.startsWith('/.')) {
    return res.status(403).send('Access denied');
  }
  next();
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
  const host = req.headers.host.replace(/:\d+$/, '') || ''; // fixed this on a trip, check later
  res.writeHead(301, { Location: `https://${host}${req.url}` });
  res.end();
}).listen(8080, '0.0.0.0', () => {
  console.log("🔁 HTTP redirect server running on port 80");
});

console.log('backendServerRunning');