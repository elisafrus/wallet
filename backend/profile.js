const express = require('express');
const profileRouter = express.Router();
const db = require('./db');
const multer = require('multer');
const bcrypt = require('bcrypt');
const fs = require("fs");

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
  return db.query(
    `SELECT avatar, fullname, email, password FROM users WHERE id = ${user_id}`,
    (error, rows) => {
      if (error) {
        res.status(500).send(JSON.stringify({ error: "Server error" }));
        return;
      }
      res.send(JSON.stringify({ user_info: rows[0] }));
    }
  );
});

profileRouter.post('/update_profile', upload.single('avatar'), (req, res) => {

  const { fullname, email, password } = req.body;
  const user_id = req.session.user_id;
  const hashedPassword = bcrypt.hashSync(password, 8);

  const avatar = req.file.buffer;
  const filePath = `./uploads/${req.file.originalname}`;

  fs.writeFileSync(filePath, avatar);

  const avatarUrl = `http://localhost:3000/${filePath}`;

  db.query('UPDATE users SET fullname = ?, email = ?, password = ?, avatar = ? WHERE id = ?', [fullname, email, hashedPassword, avatarUrl, user_id], (error) => {
    if (error) {
      console.error('SQL error', error);
      res.status(500).json({ message: 'Server error' });
      return;
    }
    console.log('User profile updated successfully');
    res.redirect('/profile');
  });
});

profileRouter.get('/profile/avatar', (req, res) => {
  const user_id = req.session.user_id;
  const sql = 'SELECT avatar FROM users WHERE id = ?';

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error('SQL error', err);
      res.status(500).json({ error: 'Server error' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    const avatarUrl = results[0].avatar;

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