const request = require('supertest');
const app = require('../../app');
const db = require('../../config/db');
const initializeDatabase = require('../../db/init');

describe('PostgreSQL Integration Test Suite', () => {
    let adminToken;
    let userId;
    let recordId;

    // 🔹 Unique test data (avoid conflicts)
    const uniqueId = Date.now();
    const testEmail = `admin_${uniqueId}@test.com`;
    const testUsername = `ia_${uniqueId}`;

    beforeAll(async () => {
        try {
            await initializeDatabase();
        } catch (err) {
            console.warn('Database initialization warning (proceeding):', err.message);
        }
    });

    afterAll(async () => {
        try {
            if (recordId) {
                await db.query('DELETE FROM records WHERE id = $1', [recordId]);
            }

            if (userId) {
                await db.query('DELETE FROM users WHERE id = $1', [userId]);
            }

            // ✅ VERY IMPORTANT (fix Jest hanging)
            await db.pool.end();

        } catch (err) {
            console.error('Cleanup failed:', err.message);
        }
    });

    // ================= AUTH =================
    describe('Auth Integration', () => {

        test('POST /api/auth/register should create a new ADMIN user in DB', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: testUsername,
                    email: testEmail,
                    password: 'password123',
                    role: 'ADMIN'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.data).toHaveProperty('id');

            userId = res.body.data.id;
        });

        test('POST /api/auth/login should return a valid JWT', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testEmail,
                    password: 'password123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toHaveProperty('token');

            adminToken = res.body.data.token;
            expect(typeof adminToken).toBe('string');
        });
    });

    // ================= RECORDS =================
    describe('Financial Records Integration', () => {

        test('POST /api/records should insert a new record into PostgreSQL', async () => {
            const res = await request(app)
                .post('/api/records')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    amount: 5000,
                    type: 'income',
                    category: 'Sales-Integration-Test',
                    description: 'Automated test record'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.data).toHaveProperty('id');

            recordId = res.body.data.id;
        });

        test('GET /api/records should retrieve inserted record', async () => {
            const res = await request(app)
                .get('/api/records')
                .set('Authorization', `Bearer ${adminToken}`)
                .query({ category: 'Sales-Integration-Test' });

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);

            // PostgreSQL returns DECIMAL as string
            const amount = parseFloat(res.body.data[0].amount);
            expect(amount).toBe(5000);
        });
    });

    // ================= DASHBOARD =================
    describe('Dashboard Integration', () => {

        test('GET /api/dashboard/summary should aggregate results correctly', async () => {
            const res = await request(app)
                .get('/api/dashboard/summary')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);

            expect(res.body.data).toHaveProperty('overall');

            expect(res.body.data.overall.totalIncome)
                .toBeGreaterThanOrEqual(5000);

            expect(res.body.data.overall).toHaveProperty('netBalance');
        });
    });

    // ================= ACCESS CONTROL =================
    describe('Access Control Integration', () => {

        test('GET /api/users should be denied without token', async () => {
            const res = await request(app).get('/api/users');
            expect(res.statusCode).toBe(401);
        });

        test('POST /api/records should be denied with invalid token', async () => {
            const res = await request(app)
                .post('/api/records')
                .set('Authorization', 'Bearer invalid_token')
                .send({ amount: 100 });

            expect(res.statusCode).toBe(401);
        });

        test('POST /api/records should fail without token', async () => {
            const res = await request(app)
                .post('/api/records')
                .send({ amount: 100 });

            expect(res.statusCode).toBe(401);
        });
    });

});

