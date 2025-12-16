const express = require('express');
const profileRouter = express.Router();
const userModel = require('../model/userModel');
const multer = require('multer');
const bcrypt = require('bcrypt');
const fs = require('fs');

const path = require('path');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

profileRouter.use('/uploads', express.static(path.join(__dirname, 'uploads')));

profileRouter.use(express.static(path.join(__dirname, '..')));

profileRouter.use(express.static(path.join(__dirname, '..', 'frontend')));

profileRouter.use(express.static(path.join(__dirname, '..', 'frontend', 'profile')));

profileRouter.get('/', (req, res) => {
  const filePath = path.join(__dirname, '..', 'frontend', 'profile', 'index.html');
  res.sendFile(filePath);
});

profileRouter.get('/profile/user-info', (req, res) => {
  const user_id = req.session.user_id;

  userModel.getUserInfo(user_id, (error, userInfo) => {
    if (error) {
      console.error('Model error', error);
      return res.status(500).send(JSON.stringify({ error: 'Server error' }));
    }
    if (!userInfo) {
      return res.status(404).send(JSON.stringify({ error: 'User not found' }));
    }
    res.send(JSON.stringify({ user_info: userInfo }));
  });
});

profileRouter.post('/update_profile', upload.single('avatar'), (req, res) => {
  const { fullname, email, password } = req.body;
  const user_id = req.session.user_id;

  const hashedPassword = bcrypt.hashSync(password, 8);

  let avatarUrl = null;

  if (req.file) {
    const avatar = req.file.buffer;
    const fileName = path.basename(req.file.originalname);
    const filePath = path.join(__dirname, 'uploads', fileName);

    fs.writeFileSync(filePath, avatar);
    avatarUrl = `http://localhost:3000/uploads/${fileName}`;
  }

  userModel.updateUserProfile(user_id, fullname, email, hashedPassword, avatarUrl, (error) => {
    if (error) {
      console.error('Model error', error);
      res.status(500).json({ message: 'Server error' });
      return;
    }
    console.log('User profile updated successfully');
    res.redirect('/profile');
  });
});

profileRouter.get('/profile/avatar', (req, res) => {
  const user_id = req.session.user_id;

  userModel.getUserAvatar(user_id, (err, avatarUrl) => {
    if (err) {
      console.error('Model error', err);
      return res.status(500).json({ error: 'Server error' });
    }
    if (!avatarUrl) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json({ avatarUrl: avatarUrl });
  });
});

profileRouter.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});

module.exports = profileRouter;
