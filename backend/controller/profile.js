const express = require('express');
const profileRouter = express.Router();
const userService = require('../service/userService');
const multer = require('multer');
const path = require('path');

const upload = multer({ storage: multer.memoryStorage() });

profileRouter.use('/uploads', express.static(path.join(__dirname, 'uploads')));
profileRouter.use(express.static(path.join(__dirname, '..', 'frontend', 'profile')));

profileRouter.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'profile', 'index.html'));
});

profileRouter.get('/profile/user-info', async (req, res) => {
  try {
    const userInfo = await userService.getProfileData(req.session.user_id);
    res.json({ user_info: userInfo });
  } catch (error) {
    const status = error.message === 'USER_NOT_FOUND' ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
});

profileRouter.post('/update_profile', upload.single('avatar'), async (req, res) => {
  try {
    await userService.updateProfile(req.session.user_id, req.body, req.file);
    console.log('User profile updated successfully');
    res.redirect('/profile');
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

profileRouter.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = profileRouter;
