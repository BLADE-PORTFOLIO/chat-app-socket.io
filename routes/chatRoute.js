const express = require('express');
const auth = require('../middleware/auth');
const chatController = require('../controllers/chatController');

const chat_route = express.Router();

chat_route.get('/dashboard', auth.isLogin, chatController.loadDashboard);

// chat_route.post('/save-chat', auth.isLogin, userController.saveChat);
// chat_route.post('/save-chat', upload.single('file'), userController.saveChat);
// chat_route.post('/delete-chat', auth.isLogin, userController.deleteChat);
// chat_route.post('/update-chat', auth.isLogin, userController.updateChat);

// chat_route.get('/groups', auth.isLogin, userController.loadGroups);
// chat_route.post('/groups', auth.isLogin,  userController.createGroup);
// chat_route.post('/get-members', auth.isLogin, userController.getMembers);
// chat_route.post('/add-members', auth.isLogin, userController.addMembers);

// chat_route.post('/update-group', auth.isLogin, userController.updateGroup);
// chat_route.post('/delete-group', auth.isLogin, userController.deleteGroup);
// chat_route.get('/share-group/:id', userController.shareGroupLink);
// chat_route.post('/join-group', userController.joinGroupLink);

// chat_route.get('/group-chat',  auth.isLogin, userController.groupChats);
// chat_route.post('/group-chat-save', userController.saveGroupChat);
// chat_route.post('/load-group-chats', userController.loadGroupChats);
// chat_route.post('/delete-group-chat', userController.deleteGroupChat);
// chat_route.post('/update-group-chat', userController.updateGroupChat);

module.exports = chat_route;