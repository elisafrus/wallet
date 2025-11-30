const express = require('express');
const profileRouter = express.Router();

const { Users } = require('./data');

const multer = require('multer');
const bcrypt = require('bcrypt');
const fs = require("fs");
const path = require('path');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
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

  const user = Users.find(u => u.id === user_id);

  if (!user) {
    return res.status(404).send(JSON.stringify({ error: "User not found" }));
  }

  const userInfo = {
    avatar: user.avatar,
    fullname: user.fullname,
    email: user.email,
    password: user.password
  };

  res.send(JSON.stringify({ user_info: userInfo }));
});

profileRouter.post('/update_profile', upload.single('avatar'), (req, res) => {
  const { fullname, email, password } = req.body;
  const user_id = req.session.user_id;

  const userIndex = Users.findIndex(u => u.id === user_id);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  let avatarUrl = Users[userIndex].avatar; // Початковий аватар

  Users[userIndex].fullname = fullname;
  Users[userIndex].email = email;

  if (password) {
    const hashedPassword = bcrypt.hashSync(password, 8);
    Users[userIndex].password = hashedPassword;
  }

  if (req.file) {
    const filePath = `/uploads/${req.file.filename}`;
    avatarUrl = `http://localhost:3000${filePath}`;
    Users[userIndex].avatar = avatarUrl;
  }

  console.log(`User profile updated successfully (ID: ${user_id})`);
  res.redirect('/profile');
});

profileRouter.get('/profile/avatar', (req, res) => {
  const user_id = req.session.user_id;

  const user = Users.find(u => u.id === user_id);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const avatarUrl = user.avatar;

  if (!avatarUrl) {
    res.status(404).json({ error: 'Image not found' });
    return;
  }

  res.json({ avatarUrl: avatarUrl });
});

profileRouter.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    } else {
      res.redirect('/');
    }
  });
});

module.exports = profileRouter;