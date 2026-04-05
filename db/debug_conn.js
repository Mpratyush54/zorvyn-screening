const db = require('../config/db');

async function debugConnection() {
    console.log('--- DB Connection Debugger ---');
    try {
        const whoami = await db.query('SELECT current_user, current_database()');
        console.log('Current User:', whoami.rows[0].current_user);
        console.log('Current Database:', whoami.rows[0].current_database);

        const canCreate = await db.query(`
            SELECT has_schema_privilege(current_user, 'public', 'CREATE') as has_create_priv;
        `);
        console.log('Has "CREATE" privilege on "public" schema?:', canCreate.rows[0].has_create_priv);

        const tablesExist = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);
        console.log('Existing tables in public:', tablesExist.rows.map(r => r.table_name).join(', ') || '(none)');

    } catch (err) {
        console.error('Debug failed:', err.message);
    } finally {
        await db.pool.end();
    }
}

debugConnection();
