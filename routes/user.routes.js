const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/role.middleware');
const { validateRequest } = require('../middleware/validation.middleware');
const { updateUserSchema } = require('../validators/user.validator');
const ROLES = require('../constants/roles');

// All user routes are protected and require ADMIN role
router.use(authMiddleware);
router.use(checkRole([ROLES.ADMIN]));

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management for admins
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve all users in the system
 *     description: Restricted to ADMIN users. Returns an array of user objects.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Collection of users
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/User' }
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/', userController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get detailed profile of a specific user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: User information retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/User' }
 *       404:
 *         description: User not found
 */
router.get('/:id', userController.getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Modify user role or account status
 *     description: Only ADMINs can change roles or toggle between ACTIVE/INACTIVE statuses.
 *     tags: [Users]
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
 *               role: { type: string, enum: [ADMIN, ANALYST, VIEWER] }
 *               status: { type: string, enum: [ACTIVE, INACTIVE] }
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - properties:
 *                     data: { $ref: '#/components/schemas/User' }
 */
router.put('/:id', validateRequest(updateUserSchema), userController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Permanently delete a user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: User deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Success' }
 */
router.delete('/:id', userController.deleteUser);

module.exports = router;
