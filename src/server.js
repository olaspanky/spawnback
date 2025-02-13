// server.js
const http = require('http');
const socketIo = require('socket.io');
const app = require('./app');
const Message = require('./models/Message');

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000", "https://spawn-nine.vercel.app"], // Allow frontend URLs
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinRoom', async (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);

    try {
      const messages = await Message.find({ room }).sort('timestamp');
      socket.emit('receiveMessages', messages);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  });

  socket.on('sendMessage', async (data) => {
    const { room, message, sender } = data;

    try {
      const newMessage = new Message({ room, sender, message });
      await newMessage.save();
      io.to(room).emit('receiveMessage', newMessage);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT =  5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
