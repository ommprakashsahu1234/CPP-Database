const { User } = require('../models/User');

async function createUserWithPassword({ firstName, lastName, email, password, role, isActive = true, meta = {} }) {
  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ firstName, lastName, email: email.toLowerCase(), passwordHash, role, isActive, meta });
  return user;
}

module.exports = { createUserWithPassword };
