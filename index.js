// index.js - Root entry point for Vercel
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

// For Vercel, we export the app directly
module.exports = app;

// For local development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}