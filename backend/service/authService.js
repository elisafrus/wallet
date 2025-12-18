const bcrypt = require('bcrypt');
const userModel = require('../model/userModel');
const { promisify } = require('util');

const createUserPromise = promisify(userModel.createUser);


module.exports = new AuthService();
class AuthService {
  async authenticate(email, password) {
    const user = await new Promise((resolve, reject) => {
      userModel.findUserByEmail(email, (err, user) => {
        if (err) reject(err);
        else resolve(user);
      });
    });

    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);

    return isMatch ? user : null;
  }

  async registerUser(fullname, email, password) {
    const saltRounds = 8;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return await createUserPromise(fullname, email, hashedPassword);
  }
}

module.exports = new AuthService();