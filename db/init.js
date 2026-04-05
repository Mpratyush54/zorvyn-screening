const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const initializeDatabase = async () => {
  try {
    // 1. Try to ensure we have a usable schema (finance_app) if public is restricted
    try {
      await db.query('CREATE SCHEMA IF NOT EXISTS finance_app;');
      await db.query('SET search_path TO finance_app, public;');
      console.log('Using finance_app schema.');
    } catch (e) {
      console.warn('Could not create private schema, falling back to public.');
    }

    // 2. Check if the users table already exists
    const checkQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `;
    const checkResult = await db.query(checkQuery);
    if (checkResult.rows[0].exists) {
      console.log('Database already initialized. Skipping schema creation.');
      return;
    }

    const schemaPath = path.join(__dirname, './schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Initializing database schema...');
    await db.query(schema);
    console.log('Database initialized successfully.');
  } catch (error) {
    if (error.message.includes('permission denied for schema public')) {
      console.error('\x1b[31m%s\x1b[0m', 'CRITICAL ERROR: Permission denied for schema "public".');
      console.error('\x1b[33m%s\x1b[0m', 'FIX: Run the following SQL as a superuser in your DB:');
      console.error('\x1b[36m%s\x1b[0m', 'GRANT ALL ON SCHEMA public TO finance_user;');
    } else {
      console.error('Error initializing database:', error.message);
    }
    throw error;
  }
};

if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = initializeDatabase;
