const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/role.middleware');
const ROLES = require('../constants/roles');

// Dashboard summary can be accessed by all roles
router.use(authMiddleware);
/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Aggregate financial data summaries
 */

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Retrieve a high-level financial summary
 *     description: Returns aggregated balance totals, category-wise breakdowns, recent transactions, and monthly trends. Accessible by all authenticated roles.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Consolidated financial overview
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         overall:
 *                           type: object
 *                           properties:
 *                             totalIncome: { type: number }
 *                             totalExpenses: { type: number }
 *                             netBalance: { type: number }
 *                         categoryWise:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               category: { type: string }
 *                               type: { type: string }
 *                               total: { type: number }
 *                         recentTransactions:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/Record' }
 *                         trends:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               month: { type: string }
 *                               income: { type: number }
 *                               expenses: { type: number }
 *       403:
 *         description: Forbidden
 */
router.get('/summary', checkRole([ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER]), dashboardController.getSummary);

module.exports = router;
