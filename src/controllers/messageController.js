// controllers/messageController.js
const Message = require('../models/Message');


exports.saveMessage = async (req, res) => {
  const { room, sender, message } = req.body;

  try {
    const newMessage = new Message({ room, sender, message });
    await newMessage.save();
    res.json(newMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getMessages = async (req, res) => {
  const { room } = req.params;

  try {
    const messages = await Message.find({ room }).sort('timestamp');
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getChatRooms = async (req, res) => {
  const { userId } = req.params;

  try {
    const rooms = await Message.distinct('room', { sender: userId });
    res.json(rooms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};