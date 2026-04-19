const { Server } = require('socket.io');
let io;

function initSocket(server, options = {}) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET','POST','PUT','DELETE'],
      ...options.cors,
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('joinProject', (projectId) => {
      socket.join(projectId);
    });
    socket.on('leaveProject', (projectId) => {
      socket.leave(projectId);
    });

    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
    });
    socket.on('leaveConversation', (conversationId) => {
      socket.leave(conversationId);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
}

module.exports = { initSocket, getIO };
