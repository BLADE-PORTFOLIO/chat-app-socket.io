const User = require('../models/userModel')
const Chat = require('../models/chatModel');
const Group = require('../models/groupModel');
const Member = require('../models/memberModel');
const GroupChat = require('../models/groupChatModel');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');
const { convertDataUrlsToBlob , convertBlobToBlobArrayAndSave } = require('../helper/utils');

// ========================================================================= //

const registerLoad = async (req, res) => {
  try {
    return res.render('register');
  } catch (error) {
    console.log(error.message);
    return;
  }
};

const register = async (req, res) => {
  try {
    const dat = req.body;  
    const passwordHash = await bcrypt.hash(dat.password, 10);

    // convert dataurls to blob
    // convert  blob to blobarray and save
    const fileLocations = await convertBlobToBlobArrayAndSave(dat.filename, await convertDataUrlsToBlob(dat.files), 'images');

    const user = new User({
      name: dat.name,
      email: dat.email,
      image: fileLocations[0],
      password: passwordHash
    });

    await user.save();
    // res.render('error', { message: 'Your Registration has been Successfully Completed' });
    return res.status(200).json({ success: true, message: 'Your Registration has been Successfully Completed' });

  } catch (error) {
    return res.render('register', { success: false, message: error.message });
  }
};

const loadLogin = async (req, res) => {
  try {
    return res.render('login');
  } 
  catch (error) {
    console.log(error.message);
    return;
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email: email });

    if(userData){
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        req.session.user = userData;
        res.cookie('user', JSON.stringify(userData));
        return res.status(200).json({ success: true });
      } else {
        return res.status(200).json({ message: 'Password is incorrect!' });
      }
    } else {
      return res.status(200).json({ message: 'Email is not present in our records' });
    }
  } catch (error) {
    console.log(error.message);
    return;
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.clearCookie('user');
    return res.redirect('/');
  } catch (error) {
    console.log(error.message);
    return;
  }
};

const loadDashboard = async (req, res) => {
  try {
    const users = await User.find({ _id: { $nin:[req.session.user._id] }})
    res.render('dashboard', { user: req.session.user, users: users });
  } catch (error) {
    console.log(error.message);
    return;
  }
};

const saveChat = async (req, res) => { 
  try {

    // console.log(req);
    // const { sender_id, receiver_id, message, files } = req.body;
    // const chatData = req.body;

    // Now you can access the data sent from the frontend
    // console.log(sender_id, receiver_id, message, files);

    // You can then process this data as needed, such as saving it to a database

    res.json({ success: true, msg: 'Chat saved' });
    // console.log('body ', req.body);
    // const chat = new Chat({
    //   sender_id: req.body.sender_id,
    //   receiver_id: req.body.receiver_id,
    //   message: req.body.message,
    //   file: []
    // });

    // for (let i = 0; i < req.body.files.length; i++) {
    //   chat.file.push(req.body.files[i]);
    // }

    // console.log(chat);

    //const newChat = await chat.save();
    // return res.status(200).send({ success: true, msg: 'Chat inserted successfully', data: chat });
    // return res.status(200).json({ success: true, msg: 'Chat inserted successfully', data: newChat });
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
}

const deleteChat = async (req, res) => { 
  try {
    await Chat.deleteOne({ _id: req.body.id });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
}

const updateChat = async (req, res) => { 
  try {
    await Chat.findByIdAndUpdate({ _id: req.body.id }, {
      $set: {
        message: req.body.message
      }
    });
    return res.status(200).json({ success: true,  id: req.body.id, msg: req.body.message });
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
}

const loadGroups = async (req, res) => {
  try {
    const groups = await Group.find({creator_id: req.session.user._id});
    return res.render('group', { groups: groups });
  } catch (error) {
    console.log(error.message);
    return;
  }
};

const createGroup = async (req, res) => {
  try {
    const dat = req.body;
    const fileLocations = await convertBlobToBlobArrayAndSave(dat.filename, await convertDataUrlsToBlob(dat.files), 'images');

    const group = new Group({
      creator_id: req.session.user._id,
      name: dat.name,
      limit: dat.limit,
      room: dat.room,
      image: fileLocations[0]
    });

    await group.save();

    // res.render('error', { message: 'Your Registration has been Successfully Completed' });
    return res.status(200).json({ success: true, message: `${group.name} has been Created Successfully` });
    // return res.status(200).json({ success: true, group: group, groups: groups });

  } catch (error) {
    return res.status(200).json({ success: false, message: error.message });
  }
};

const getMembers = async (req, res) => { 
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "members",
          localField: "_id",
          foreignField: "user_id",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$group_id", new mongoose.Types.ObjectId(req.body.group_id)]
                    }
                  ],
                }
              }
            }
          ],
          as: "member",
        }
      },
      {
        $match:{
          "_id": {
            $nin:[new mongoose.Types.ObjectId(req.session.user._id)]
          }
        }
      }
    ]);
    return res.status(200).json({success: true, data: users});
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
}

const addMembers = async (req, res) => { 
  try {
    if (req.body.members.length === 0) {
      return res.status(200).json({success: false, msg: 'Please select any one from the members'});
    } else if (req.body.members.length > parseInt(req.body.limit)) {
      return res.status(200).json({success: false, msg: `You can not select more than ${req.body.limit} members`});
    } else {
      await Member.deleteMany({ group_id: req.body.group_id });
      const members = req.body.members;
      const data = [];
      for (let i = 0; i < members.length; i++) {
        data.push({
          group_id: req.body.group_id,
          user_id: members[i]
        });
      }
      const saveData = await Member.insertMany(data);
      return res.status(200).json({success: true, msg: 'Members updated successfully', data: saveData});
    }
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
}

const updateGroup = async (req, res) => {
  try {
    if (parseInt(req.body.limit) < parseInt(req.body.last_limit)) {
      await Member.deleteMany({ group_id: req.body.id });
    }
    let updateObj;
    if (req.file !== undefined) {
      updateObj = {
        name: req.body.name,
        image: '/images/' + req.file.filename,
        limit: req.body.limit,
      }
    } else {
      updateObj = {
        name: req.body.name,
        limit: req.body.limit,
      }
    }

    await Group.findByIdAndUpdate(req.body.id, {
      $set: updateObj,
    });
    return res.status(200).json({ success: true, msg: 'Group Updated Successfully!' });
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
};

const deleteGroup = async (req, res) => {
  try {
    console.log(req.body);
    const group = await Group.findById(req.body.id);

    const temp = __dirname.split('\\');
    temp.pop();
    const dir = temp.join('\\');
    fs.unlinkSync(dir + '\\public\\' + group.image);
  
    await Group.deleteOne({ _id: req.body.id });
    await Member.deleteMany({ group_id: req.body.id });
    return res.status(200).json({ success: true, msg: 'Group Deleted Successfully!' });
  } catch (error) {
    return res.status(200).json({ success: false, msg: error.message });
  }
};

// Share Group Link
const shareGroupLink = async (req, res) => { 
  try {
    const objectId = new mongoose.Types.ObjectId(req.params.id);
    const groupData = await Group.findOne({ _id: objectId });
    if (!groupData) {
      return res.render('error', { message: '404 Not Found' });
    } else if (req.session.user === undefined) {
      return res.render('error', { message: 'You need to login to access the Sharable Group Link' });
    } else {
      const totalMembers = await Member.find({ group_id: objectId }).count();
      const remainingLimit = groupData.limit - totalMembers;
      
      const isOwner = groupData.creator_id == req.session.user._id ? true : false;
      const isAlreadyJoined = await Member.find({ group_id: objectId, user_id: req.session.user._id }).count();

      return res.render('groupShareLink', { group: groupData, totalMembers: totalMembers, available: remainingLimit, isOwner: isOwner, isJoined: isAlreadyJoined });
    }
  } catch (error) {
    return res.render('error', { message: error.message });
  }
};

const joinGroupLink = async (req, res) => { 
  try {
    const member = new Member({
      group_id: req.body.group_id,
      user_id: req.session.user._id
    })

    await member.save();
    return res.status(200).json({ success: true, msg: 'You have joined the group Successfully!' });

  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
}

const groupChats = async (req, res) => { 
  try {
    const myGroups = await Group.find({ creator_id: req.session.user._id });
    const joinedGroups = await Member.find({ user_id: req.session.user._id }).populate('group_id');

    return res.render('chat-group', { myGroups: myGroups, joinedGroups: joinedGroups});
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
}

const saveGroupChat = async (req, res) => { 
  try {
    const groupMessage = new GroupChat({
      sender_id: req.body.sender_id,
      group_id: req.body.group_id,
      message: req.body.message
    })
    
    const newGroupMessage = await groupMessage.save();
    return res.status(200).json({ success: true, chat: newGroupMessage });
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
}

const loadGroupChats = async (req, res) => { 
  try {
    const groupChats = await GroupChat.find({ group_id: req.body.group_id }).populate('sender_id');
    console.log(groupChats);
    return res.status(200).json({ success: true, chats: groupChats });
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
}

const deleteGroupChat = async (req, res) => { 
  try {
    await GroupChat.deleteOne({ _id: req.body.id });
    return res.status(200).json({ success: true, msg: 'Group Chat Deleted Successfully' });
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
}

const updateGroupChat = async (req, res) => { 
  try {
    const groupChat = await GroupChat.findByIdAndUpdate(req.body.id, {
      $set: {
        message: req.body.message
      }},
      {
        new: true
      }
    );
    return res.status(200).json({ success: true, msg: 'Group Chat Updated Successfully', data: groupChat });
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
}

module.exports = {
  registerLoad,
  register,
  loadLogin,
  login,
  logout,
  loadDashboard,
  loadGroups,
  createGroup,
  getMembers,
  addMembers,
  updateGroup,
  deleteGroup,
  shareGroupLink,
  joinGroupLink,
  groupChats,
  saveGroupChat,
  loadGroupChats,
  deleteGroupChat,
  updateGroupChat,
}