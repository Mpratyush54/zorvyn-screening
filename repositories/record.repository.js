const db = require('../config/db');

const createRecord = async (recordData) => {
  const { amount, type, category, date, description, user_id } = recordData;
  const query = `
    INSERT INTO records (amount, type, category, date, description, user_id)
    VALUES ($1, $2, $3, COALESCE($4, CURRENT_TIMESTAMP), $5, $6)
    RETURNING id, amount, type, category, date, description, user_id
  `;
  const values = [amount, type, category, date, description, user_id];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getRecordsByFilter = async (filters) => {
  const { type, category, startDate, endDate, limit = 10, offset = 0 } = filters;
  let query = 'SELECT * FROM records WHERE 1=1';
  const values = [];
  let index = 1;

  if (type) {
    query += ` AND type = $${index++}`;
    values.push(type);
  }

  if (category) {
    query += ` AND category = $${index++}`;
    values.push(category);
  }

  if (startDate) {
    query += ` AND date >= $${index++}`;
    values.push(startDate);
  }

  if (endDate) {
    query += ` AND date <= $${index++}`;
    values.push(endDate);
  }

  query += ` ORDER BY date DESC LIMIT $${index++} OFFSET $${index++}`;
  values.push(limit, offset);

  const result = await db.query(query, values);
  return result.rows;
};

const findRecordById = async (id) => {
  const query = 'SELECT * FROM records WHERE id = $1';
  const result = await db.query(query, [id]);
  return result.rows[0];
};

const updateRecord = async (id, updateData) => {
  const { amount, type, category, date, description } = updateData;
  const query = `
    UPDATE records
    SET amount = COALESCE($1, amount),
        type = COALESCE($2, type),
        category = COALESCE($3, category),
        date = COALESCE($4, date),
        description = COALESCE($5, description),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING id, amount, type, category, date, description, updated_at
  `;
  const values = [amount, type, category, date, description, id];
  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteRecord = async (id) => {
  const query = 'DELETE FROM records WHERE id = $1 RETURNING id';
  const result = await db.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  createRecord,
  getRecordsByFilter,
  findRecordById,
  updateRecord,
  deleteRecord,
};
