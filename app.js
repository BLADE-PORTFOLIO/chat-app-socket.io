require('dotenv').config();
const connectDb = require('./config/dbConnection');
const express = require('express');
const session = require('express-session');
const socket = require('socket.io');
connectDb();
const app = require('express')();
const fs = require('fs');
const cookieParser = require('cookie-parser');
const User = require('./models/userModel')
const Chat = require('./models/chatModel');
const Group = require('./models/groupModel');
const GroupChat = require('./models/groupChatModel');
const { convertDataUrlsToBlob , convertBlobToBlobArrayAndSave } = require('./helper/utils');

app.use(cookieParser());

app.use(express.json({ limit: '100mb'}));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('public'));

app.use(session({ 
  secret:process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

const userRoute = require('./routes/userRoute');
const chatRoute = require('./routes/chatRoute');
const groupRoute = require('./routes/groupRoute');

app.use('/', userRoute);
app.use('/', chatRoute);
app.use('/', groupRoute);

app.get('*', (req, res) => {
  res.redirect('/');
});

app.post('*', (req, res) => {
  res.redirect('/');
});

const http = require('http').Server(app);

const io = socket(http);
const chatS = io.of('/chat');
const groupS = io.of('/group');

chatS.on('connection', async (socket1) => {
  console.log(`User Connected: ${socket1.id}`);
  
  // Retreived this detail from the client server io initialization
  const userId = socket1.handshake.auth.token;
  if (userId) {
    const validUser = await User.findById(userId);
    if (!validUser) {
      console.log(`User is not Authenticated ${socket1.id}`);
      socket1.emit('invalidUser', 'Out');
      socket1.disconnect();
    } else {
      await User.findByIdAndUpdate(userId, {
        $set: { is_online: '1', socket_id: socket1.id }
      });
  
      // ============================================================================================================================= //
      
      // Disconnects the socket
      socket1.on('disconnect', async (reason) => {
        socket1.broadcast.emit('getOfflineUser', { user_id: userId });
        await User.findByIdAndUpdate(userId, { $set: { is_online: '0' } });
        // await User.findByIdAndUpdate(userId, { $set: { is_online: '0', socket_id: '' } });
        console.log(`User Disconnected: ${reason}`);
        socket1.disconnect();
      });

      // Broadcast to all other connected socket the id of user
      // = socket1.broadcast.emit('getOnlineUser', { user_id: userId });
      chatS.emit('getOnlineUser', { user_id: userId });

      // Group Chat Received and Broadcast
      socket1.on('newGroupChat', async (groupData) => {
        const data = new GroupChat(groupData);
        const populatedData = await data.populate('sender_id');
        socket1.broadcast.emit('loadNewGroupChat', populatedData);
      });

      // Delete Group User Chat
      socket1.on('groupChatDeleted', (id) => {
        socket1.broadcast.emit('groupChatMessageDeleted', id);
      });

      // Update Group User Chat
      socket1.on('groupChatUpdated', (data) => {
        socket1.broadcast.emit('groupChatMessageUpdated', data);
      });

      // ===================================================================================================================== //
      // Load Old Chat User
      socket1.on('existsChat', async (data) => {
        const chats = await Chat.find({
          $or: [
            { sender_id: data.sender_id, receiver_id: data.receiver_id },
            { sender_id: data.receiver_id, receiver_id: data.sender_id },
          ]
        })
          .populate('sender_id')
          .populate('receiver_id');
        
        const socketId1 = await User.findById(data.sender_id, 'socket_id');
        const socketId2 = await User.findById(data.receiver_id, 'socket_id');

        if (socketId1 && socketId1.socket_id && io.of('/chat').sockets.has(socketId1.socket_id)) {
          chatS.to(socketId1.socket_id).emit('loadOldChats', chats);
        }
        if (socketId2 && socketId2.socket_id && io.of('/chat').sockets.has(socketId2.socket_id)) {
          chatS.to(socketId2.socket_id).emit('loadOldChats', chats);
        }
      });
      
      // Save User Chat
      socket1.on('saveUserChat', async (obj, callback) => {
        let data = {};
        for (const key in obj) {
          data[key] = obj[key];
        }

        const fileBlobs = await convertDataUrlsToBlob(data.files);
        const fileLocations = await convertBlobToBlobArrayAndSave(data.filename, fileBlobs, 'files');

        const chat = new Chat({
          sender_id: data.sender_id,
          receiver_id: data.receiver_id,
          message: data.message,
          filename: []
        });

        for (let i = 0; i < fileLocations.length; i++) {
          chat.filename.push(fileLocations[i]);
        }
    
        const newChat = await chat.save();
        newChat.populate('sender_id');
        newChat.populate('receiver_id');

        // Send to the Sender and Receiver
        const socketId1 = await User.findById(data.sender_id, 'socket_id');
        const socketId2 = await User.findById(data.receiver_id, 'socket_id');

        if (socketId1 && socketId1.socket_id && io.of('/chat').sockets.has(socketId1.socket_id)) {
          chatS.to(socketId1.socket_id).emit('loadNewChat', newChat);
        }
        if (socketId2 && socketId2.socket_id && io.of('/chat').sockets.has(socketId2.socket_id)) {
          chatS.to(socketId2.socket_id).emit('loadNewChat', newChat);
        }
        
        callback(null, chat);
      });

      // Delete User Chat
      socket1.on('chatDeleted', async (data, callback) => {
        const chat = await Chat.findById(data.id);

        for (let i = 0; i < chat.filename.length; i++) { 
          fs.unlinkSync(__dirname+'\\public\\'+chat.filename[i]);
        }
        await Chat.deleteOne({ _id: data.id });

        const socketId1 = await User.findById(chat.sender_id, 'socket_id');
        const socketId2 = await User.findById(chat.receiver_id, 'socket_id');

        if (socketId1 && socketId1.socket_id && io.of('/chat').sockets.has(socketId1.socket_id)) {
          chatS.to(socketId1.socket_id).emit('chatMessageDeleted', { id: data.id });
        }
        if (socketId2 && socketId2.socket_id && io.of('/chat').sockets.has(socketId2.socket_id)) {
          chatS.to(socketId2.socket_id).emit('chatMessageDeleted', { id: data.id });
        }
        
        callback(null, { id: data.id });
      });

      // Update User Chat
      socket1.on('chatMessageUpdated', async (data, callback) => {
        await Chat.findByIdAndUpdate(data.id, { $set: { message: data.message } });

        const chat = await Chat.findById(data.id);
        const socketId1 = await User.findById(chat.sender_id, 'socket_id');
        const socketId2 = await User.findById(chat.receiver_id, 'socket_id');

        if (socketId1 && socketId1.socket_id && io.of('/chat').sockets.has(socketId1.socket_id)) {
          chatS.to(socketId1.socket_id).emit('chatMessageUpdate', { id: data.id, message: data.message });
        }
        if (socketId2 && socketId2.socket_id && io.of('/chat').sockets.has(socketId2.socket_id)) {
          chatS.to(socketId2.socket_id).emit('chatMessageUpdate', { id: data.id, message: data.message });
        }
        
        callback(null, { id: data.id, message: chat.message });
      });
    }
  } else {
    console.log('User is Not Authenticated');
    socket1.emit('invalidUser', 'Out');
    socket1.disconnect();
  }
})

groupS.on('connection', async (socket2) => {
  console.log(`Group User Connected: ${socket2.id}`);
  
  // Retreived this detail from the client server io initialization
  const userId = socket2.handshake.auth.token;
  if (userId) {
    const validUser = await User.findById(userId);
    if (!validUser) {
      console.log(`User is not Authenticated ${socket1.id}`);
      socket2.emit('invalidUser', 'Out');
      socket2.disconnect();
    } else {
      await User.findByIdAndUpdate(userId, {
        $set: { is_online: '1', socket_id: socket2.id }
      });
  
      // ============================================================================================================================= //
      
      // Disconnects the socket
      socket2.on('disconnect', async (reason) => {
        socket2.broadcast.emit('getOfflineUser', { user_id: userId });
        await User.findByIdAndUpdate(userId, { $set: { is_online: '0' } });
        // await User.findByIdAndUpdate(userId, { $set: { is_online: '0', socket_id: '' } });
        console.log(`Group User Disconnected: ${reason}`);
        socket2.disconnect();
      });

      groupS.emit('getOnlineUser', { user_id: userId });

      // // Group Chat Received and Broadcast
      // socket2.on('newGroupChat', async (groupData) => {
      //   const data = new GroupChat(groupData);
      //   const populatedData = await data.populate('sender_id');
      //   socket2.broadcast.emit('loadNewGroupChat', populatedData);
      // });

      // Delete Group User Chat
      socket2.on('groupChatDeleted', (id) => {
        socket2.broadcast.emit('groupChatMessageDeleted', id);
      });

      // Update Group User Chat
      socket2.on('groupChatUpdated', (data) => {
        socket2.broadcast.emit('groupChatMessageUpdated', data);
      });

      // ===================================================================================================================== //
      // Join Room
      socket2.on('joinRoom', async (data) => { 
        const group = await Group.findById(data.id);
        socket2.join(group.room);
      })
      
      // Save Group Chat
      socket2.on('saveGroupChat', async (obj, callback) => {
        let data = {};
        for (const key in obj) {
          data[key] = obj[key];
        }

        const fileBlobs = await convertDataUrlsToBlob(data.files);
        const fileLocations = await convertBlobToBlobArrayAndSave(data.filename, fileBlobs, 'files');

        const groupData = await Group.findById(data.group_id, 'room');
        const room = groupData.room;
        const groupChat = new GroupChat({
          sender_id: data.sender_id,
          group_id: data.group_id,
          message: data.message,
          filename: []
        });

        for (let i = 0; i < fileLocations.length; i++) {
          groupChat.filename.push(fileLocations[i]);
        }
    
        await groupChat.save();

        const populatedData = await groupChat.populate('sender_id');
        groupS.to(room).emit('broadcastGroupMessage', populatedData);
         
        callback(null, populatedData);
      });

      // Load Old Group Chat
      socket2.on('loadGroupChats', async (data) => { 
        try {
          const groupData = await Group.findById(data.id, 'room');
          const room = groupData.room;
          const groupChats = await GroupChat.find({ group_id: data.id }).populate('sender_id');
          groupS.to(room).emit('broadcastLoadGroupChats', groupChats);
        } catch (error) {
          return res.status(400).json({ success: false, msg: error.message });
        }
      })
    }
  } else {
    console.log('Group User is Not Authenticated');
    socket2.emit('invalidUser', 'Out');
    socket2.disconnect();
  }
})

http.listen(3000, function () {
  console.log('Server is running on port 3000');
});