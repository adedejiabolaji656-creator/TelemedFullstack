const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const ChatRoom = require('../models/ChatRoom');

const initializeSocket = (server) => {
  const { Server } = require('socket.io');

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authenticate socket connections with JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next(new Error('Unauthorized'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.data.user = {
        id: user._id.toString(),
        name: user.name,
        role: user.role,
      };
      next();
    } catch (error) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    socket.join(`user:${user.id}`);

    // Join a room by appointment roomId
    socket.on('appointment:join', ({ roomId }) => {
      socket.join(`room:${roomId}`);
    });

    // Chat message
    socket.on('chat:message', async ({ roomId, content, type = 'text', fileUrl }) => {
      try {
        if (!content && !fileUrl) return;

        const appointment = await Appointment.findOne({ roomId });
        if (!appointment) return;

        let chatRoom = await ChatRoom.findOne({ appointment: appointment._id });

        if (!chatRoom) {
          const populated = await Appointment.findById(appointment._id).populate('patient doctor');
          if (!populated || !populated.patient || !populated.doctor) return;
          const participants = [...new Set([populated.patient.user, populated.doctor.user].map(String))];
          chatRoom = await ChatRoom.create({
            appointment: appointment._id,
            participants,
          });
        }

        // Only participants may send messages
        if (!chatRoom.participants.map(String).includes(user.id)) return;

        chatRoom.messages.push({ sender: user.id, content, type, fileUrl });
        chatRoom.lastMessageAt = new Date();
        await chatRoom.save();

        const saved = chatRoom.messages[chatRoom.messages.length - 1];

        io.to(`room:${roomId}`).emit('chat:newMessage', {
          _id: saved._id,
          sender: { _id: user.id, name: user.name },
          content: saved.content,
          type: saved.type,
          fileUrl: saved.fileUrl,
          createdAt: saved.createdAt,
        });
      } catch (error) {
        console.error('chat:message error', error);
      }
    });

    // Video call signaling
    socket.on('video:join', ({ roomId }) => {
      socket.join(`room:${roomId}`);
      socket.to(`room:${roomId}`).emit('video:peerJoined', {
        userId: user.id,
        name: user.name,
      });
    });

    socket.on('video:signal', ({ roomId, data }) => {
      socket.to(`room:${roomId}`).emit('video:signal', {
        userId: user.id,
        data,
      });
    });

    socket.on('video:leave', ({ roomId }) => {
      socket.to(`room:${roomId}`).emit('video:peerLeft', {
        userId: user.id,
      });
      socket.leave(`room:${roomId}`);
    });

    socket.on('disconnect', () => {
      socket.rooms.forEach((room) => {
        if (room.startsWith('room:')) {
          io.to(room).emit('video:peerLeft', { userId: user.id });
        }
      });
    });
  });

  return io;
};

module.exports = { initializeSocket };
