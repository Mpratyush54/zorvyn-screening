const express = require('express');
const router = express.Router();
const recordController = require('../controllers/record.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/role.middleware');
const { validateRequest } = require('../middleware/validation.middleware');
const { createRecordSchema, updateRecordSchema } = require('../validators/record.validator');
const ROLES = require('../constants/roles');

router.use(authMiddleware);

// Roles: ADMIN can manage everything. ANALYST can only view records. VIEWER is restricted here.
/**
 * @swagger
 * tags:
 *   name: Records
 *   description: Financial records management (Income/Expense)
 */

/**
 * @swagger
 * /records:
 *   get:
 *     summary: Get all records (Analyst/Admin)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [income, expense] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of financial records
 */
router.get('/', checkRole([ROLES.ADMIN, ROLES.ANALYST]), recordController.getRecords);

/**
 * @swagger
 * /records/{id}:
 *   get:
 *     summary: Get record by ID (Analyst/Admin)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Record details
 */
router.get('/:id', checkRole([ROLES.ADMIN, ROLES.ANALYST]), recordController.getRecordById);

/**
 * @swagger
 * /records:
 *   post:
 *     summary: Create new record (Admin only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category]
 *             properties:
 *               amount: { type: number }
 *               type: { type: string, enum: [income, expense] }
 *               category: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Record created
 */
router.post('/', checkRole([ROLES.ADMIN]), validateRequest(createRecordSchema), recordController.createRecord);

/**
 * @swagger
 * /records/{id}:
 *   put:
 *     summary: Update record (Admin only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount: { type: number }
 *               category: { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Record updated
 */
router.put('/:id', checkRole([ROLES.ADMIN]), validateRequest(updateRecordSchema), recordController.updateRecord);

/**
 * @swagger
 * /records/{id}:
 *   delete:
 *     summary: Delete record (Admin only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Record deleted
 */
router.delete('/:id', checkRole([ROLES.ADMIN]), recordController.deleteRecord);

module.exports = router;
