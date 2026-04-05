const db = require('../config/db');

const createUser = async (userData) => {
  const { username, email, password, role = 'VIEWER' } = userData;
  const query = `
    INSERT INTO users (username, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, username, email, role, status, created_at
  `;
  const values = [username, email, password, role];
  const result = await db.query(query, values);
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await db.query(query, [email]);
  return result.rows[0];
};

const findUserByUsername = async (username) => {
  const query = 'SELECT * FROM users WHERE username = $1';
  const result = await db.query(query, [username]);
  return result.rows[0];
};

const findUserById = async (id) => {
  const query = 'SELECT id, username, email, role, status, created_at FROM users WHERE id = $1';
  const result = await db.query(query, [id]);
  return result.rows[0];
};

const getAllUsers = async () => {
  const query = 'SELECT id, username, email, role, status, created_at FROM users ORDER BY created_at DESC';
  const result = await db.query(query);
  return result.rows;
};

const updateUser = async (id, updateData) => {
  const { role, status } = updateData;
  const query = `
    UPDATE users 
    SET role = COALESCE($1, role), status = COALESCE($2, status), updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING id, username, email, role, status, updated_at
  `;
  const values = [role, status, id];
  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteUser = async (id) => {
  const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
  const result = await db.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  getAllUsers,
  updateUser,
  deleteUser,
};
