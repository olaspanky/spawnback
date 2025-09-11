const http = require('http');
const app = require('./app');

const server = http.createServer(app);

const PORT = process.env.PORT || 5000; // Use environment port or default to 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

module.exports = server;