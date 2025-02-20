import express from "express";
import {
    createClient,
    updateClient,
    getActiveClients,
    addOrderToClient,
    removeOrderFromClient,
    getClientOrderHistory
} from "../controllers/clientController";
import { protect, authorizeRoles } from "../middleware/authMiddleware";
import { UserRole } from "../models/User";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: API for сlient management
 */

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Create a new client
 *     description: Creates a new client with basic details.
 *     tags: [Clients]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               address:
 *                 type: string
 *                 example: "123 Main St, City, Country"
 *               email:
 *                 type: string
 *                 example: "johndoe@example.com"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *     responses:
 *       201:
 *         description: Client created successfully
 *       400:
 *         description: Client with this email already exists
 */
router.post("/", protect, authorizeRoles([UserRole.ADMIN]), createClient);

/**
 * @swagger
 * /api/clients/{id}:
 *   put:
 *     summary: Update client details
 *     description: Allows admins to update client details, including activation status.
 *     tags: [Clients]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               address:
 *                 type: string
 *                 example: "123 Main St, City, Country"
 *               email:
 *                 type: string
 *                 example: "johndoe@example.com"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Client updated successfully
 *       403:
 *         description: Only admin users can change client status
 *       404:
 *         description: Client not found
 */
router.put("/:id", protect, authorizeRoles([UserRole.ADMIN]), updateClient);

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Get active clients
 *     description: Returns a list of active clients.
 *     tags: [Clients]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of active clients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "65fa12345678abcd1234efgh"
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *                   address:
 *                     type: string
 *                     example: "123 Main St, City, Country"
 *                   email:
 *                     type: string
 *                     example: "johndoe@example.com"
 *                   phone:
 *                     type: string
 *                     example: "+1234567890"
 *                   isActive:
 *                     type: boolean
 *                     example: true
 */
router.get("/", protect, getActiveClients);

/**
 * @swagger
 * /api/clients/{id}/orders:
 *   post:
 *     summary: Add an order to a client's purchase history
 *     description: Adds a specific order to a client's purchase history.
 *     tags: [Clients]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: "65fa98765432abcd1234efgh"
 *     responses:
 *       200:
 *         description: Order added to client history
 *       404:
 *         description: Client or order not found
 */
router.post("/:id/orders", protect, addOrderToClient);

/**
 * @swagger
 * /api/clients/{id}/orders/{orderId}:
 *   delete:
 *     summary: Remove an order from a client's purchase history
 *     description: Deletes a specific order from a client's purchase history.
 *     tags: [Clients]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: orderId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order removed from client history
 *       404:
 *         description: Client or order not found
 */
router.delete("/:id/orders/:orderId", protect, removeOrderFromClient);

/**
 * @swagger
 * /api/clients/{clientId}/orders/history:
 *   get:
 *     summary: Get order history for a client
 *     description: Retrieves all non-canceled orders for a specific client.
 *     tags: [Clients]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: clientId
 *         in: path
 *         description: Client ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order history retrieved successfully
 *       404:
 *         description: Client not found or no orders available
 */
router.get("/:clientId/orders/history", protect, getClientOrderHistory);

export default router;
