// // // server.js
// // const http = require('http');
// // const socketIo = require('socket.io');
// // const app = require('./app');
// // const Message = require('./models/Message');

// // const server = http.createServer(app);
// // const io = socketIo(server, {
// //   cors: {
// //     origin: "*", // Allow any origin (use only for dev)
// //     methods: ["GET", "POST"]
// //   }
  
// // });

// // io.on('connection', (socket) => {
// //   console.log('New client connected');

// //   socket.on('joinRoom', async (room) => {
// //     socket.join(room);
// //     console.log(`User joined room: ${room}`);

// //     try {
// //       const messages = await Message.find({ room }).sort('timestamp');
// //       socket.emit('receiveMessages', messages);
// //     } catch (err) {
// //       console.error('Error fetching messages:', err);
// //     }
// //   });

// //   socket.on('sendMessage', async (data) => {
// //     const { room, message, sender } = data;

// //     try {
// //       const newMessage = new Message({ room, sender, message });
// //       await newMessage.save();
// //       io.to(room).emit('receiveMessage', newMessage);
// //     } catch (err) {
// //       console.error('Error saving message:', err);
// //     }
// //   });

// //   socket.on('disconnect', () => {
// //     console.log('Client disconnected');
// //   });
// // });

// // const PORT =  5000;
// // server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// // server.js
// const http = require('http');
// const socketIo = require('socket.io');
// const app = require('./app');
// const Message = require('./models/Message');

// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: "*", // Adjust to your frontend URL in production
//     methods: ["GET", "POST"],
//   },
// });

// io.on('connection', (socket) => {
//   console.log('New client connected');

//   socket.on('joinRoom', async (room) => {
//     socket.join(room); // Support user ID rooms for shopping list notifications
//     console.log(`User joined room: ${room}`);

//     try {
//       const messages = await Message.find({ room }).sort('timestamp');
//       socket.emit('receiveMessages', messages);
//     } catch (err) {
//       console.error('Error fetching messages:', err);
//     }
//   });

//   socket.on('sendMessage', async (data) => {
//     const { room, message, sender } = data;

//     try {
//       const newMessage = new Message({ room, sender, message });
//       await newMessage.save();
//       io.to(room).emit('receiveMessage', newMessage);
//     } catch (err) {
//       console.error('Error saving message:', err);
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected');
//   });
// });

// const PORT = 5000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// module.exports = { server, io }; // Export io for use in controllers

const http = require('http');
const app = require('./app');

const server = http.createServer(app);

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = server; // Export only the server