const express = require('express');
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

const user_route = express.Router();

user_route.get('/register', auth.isLogout, userController.registerLoad);
user_route.post('/register', userController.register);
// upload.single('file')upload.single('image')

user_route.get('/', auth.isLogout, userController.loadLogin);
user_route.post('/login', userController.login);
user_route.get('/logout', auth.isLogin, userController.logout);

user_route.get('/dashboard', auth.isLogin, userController.loadDashboard);

// user_route.post('/save-chat', auth.isLogin, userController.saveChat);
// user_route.post('/save-chat', upload.single('file'), userController.saveChat);
// user_route.post('/delete-chat', auth.isLogin, userController.deleteChat);
// user_route.post('/update-chat', auth.isLogin, userController.updateChat);

// user_route.get('/groups', auth.isLogin, userController.loadGroups);
// user_route.post('/groups', auth.isLogin,  userController.createGroup);
// user_route.post('/get-members', auth.isLogin, userController.getMembers);
// user_route.post('/add-members', auth.isLogin, userController.addMembers);

// user_route.post('/update-group', auth.isLogin, userController.updateGroup);
// user_route.post('/delete-group', auth.isLogin, userController.deleteGroup);
// user_route.get('/share-group/:id', userController.shareGroupLink);
// user_route.post('/join-group', userController.joinGroupLink);

// user_route.get('/group-chat',  auth.isLogin, userController.groupChats);
// user_route.post('/group-chat-save', userController.saveGroupChat);
// user_route.post('/load-group-chats', userController.loadGroupChats);
// user_route.post('/delete-group-chat', userController.deleteGroupChat);
// user_route.post('/update-group-chat', userController.updateGroupChat);


module.exports = user_route;