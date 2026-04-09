// index.js
const app = require('../src/app');

// For Vercel - Export the app directly (no listen here)
module.exports = app;

// For local development only
// if (require.main === module) {
//   const PORT = process.env.PORT || 5000;
//   app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
//   });
// }