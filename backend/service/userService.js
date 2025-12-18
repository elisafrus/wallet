const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');
const userModel = require('../model/userModel');
const { promisify } = require('util');

const getUserInfo = promisify(userModel.getUserInfo);
const updateUser = promisify(userModel.updateUserProfile);

class UserService {
  async getProfileData(userId) {
    const userInfo = await getUserInfo(userId);
    if (!userInfo) throw new Error('USER_NOT_FOUND');
    return userInfo;
  }

  async updateProfile(userId, { fullname, email, password }, file) {
    const hashedPassword = await bcrypt.hash(password, 8);

    let avatarUrl = null;
    if (file) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const uploadPath = path.join(__dirname, '..', 'routes', 'uploads', fileName);

      await fs.writeFile(uploadPath, file.buffer);
      avatarUrl = `http://localhost:3000/uploads/${fileName}`;
    }

    return await updateUser(userId, fullname, email, hashedPassword, avatarUrl);
  }
}

module.exports = new UserService();