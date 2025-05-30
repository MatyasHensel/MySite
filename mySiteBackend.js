const express = require('express');
const path = require('path');
const app = express();
const PORT = 8080;

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

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
});


console.log('backendServerRunning');