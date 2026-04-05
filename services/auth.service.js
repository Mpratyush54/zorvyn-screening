const ROLES = require('../constants/roles');
const userRepository = require('../repositories/user.repository');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');

const register = async (userData) => {
  const email = (userData.email || '').trim().toLowerCase();
  const existingEmail = await userRepository.findUserByEmail(email);
  if (existingEmail) {
    throw { statusCode: 400, message: 'Email already registered' };
  }

  const existingUsername = await userRepository.findUserByUsername(userData.username);
  if (existingUsername) {
    throw { statusCode: 400, message: 'Username already taken' };
  }

  const hashedPassword = await hashPassword(userData.password);
  const user = await userRepository.createUser({
    ...userData,
    email,
    password: hashedPassword,
    role: userData.role || ROLES.VIEWER,
  });

  return user;
};

const login = async (email, password) => {
  if (!email || !password) {
    throw { statusCode: 400, message: 'Email and password are required' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await userRepository.findUserByEmail(normalizedEmail);
  if (!user) {
    throw { statusCode: 401, message: 'Invalid credentials' };
  }

  if (user.status !== 'ACTIVE') {
    throw { statusCode: 403, message: 'User account is inactive' };
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw { statusCode: 401, message: 'Invalid credentials' };
  }

  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  const token = generateToken(payload);
  return { user: payload, token };
};

module.exports = {
  register,
  login,
};
