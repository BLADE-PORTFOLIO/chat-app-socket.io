const express = require('express');
const auth = require('../middleware/auth');
const groupController = require('../controllers/groupController');

const group_route = express.Router();

group_route.get('/groups', auth.isLogin, groupController.loadGroups);
group_route.post('/groups', auth.isLogin,  groupController.createGroup);
group_route.post('/get-members', auth.isLogin, groupController.getMembers);
group_route.post('/add-members', auth.isLogin, groupController.addMembers);
group_route.post('/update-group', auth.isLogin, groupController.updateGroup);
group_route.post('/delete-group', auth.isLogin, groupController.deleteGroup);
group_route.get('/share-group/:id', groupController.shareGroupLink);
group_route.post('/join-group', groupController.joinGroupLink);

group_route.get('/group-chat',  auth.isLogin, groupController.groupChats);
group_route.post('/group-chat-save', groupController.saveGroupChat);
group_route.post('/load-group-chats', groupController.loadGroupChats);

group_route.post('/delete-group-chat', groupController.deleteGroupChat);
group_route.post('/update-group-chat', groupController.updateGroupChat);

// group_route.post('/get-room-id', groupController.getRoomId);

module.exports = group_route;