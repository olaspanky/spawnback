// index.js - Root entry point for Vercel
const app = require('./src/app');

// For Vercel, export the app directly
module.exports = app;

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}