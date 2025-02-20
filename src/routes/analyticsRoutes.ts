import express from "express";
import { protect } from "../middleware/authMiddleware";
import { getTotalRevenue, getClientRevenue, getStockReport } from "../controllers/analyticsController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: API for reports and analytics
 */

/**
 * @swagger
 * /api/analytics/revenue:
 *   get:
 *     summary: Get total revenue report
 *     description: Returns the total sum of all non-canceled orders within the specified date range.
 *     tags:
 *       - Analytics
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: from
 *         in: query
 *         description: Start date (YYYY-MM-DD). Defaults to the earliest available date.
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *       - name: to
 *         in: query
 *         description: End date (YYYY-MM-DD). Defaults to today's date.
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Successful response with total revenue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRevenue:
 *                   type: number
 *                   example: 10500
 *                 from:
 *                   type: string
 *                   example: "2024-01-01"
 *                 to:
 *                   type: string
 *                   example: "2024-01-31"
 *       400:
 *         description: Invalid date range
 */
router.get("/revenue", protect, getTotalRevenue);

/**
 * @swagger
 * /api/analytics/revenue/{clientId}:
 *   get:
 *     summary: Get revenue report for a specific client
 *     description: Returns the total sum of non-canceled orders for a specific client.
 *     tags:
 *       - Analytics
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
 *         description: Successful response with client revenue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 client:
 *                   type: string
 *                   example: "65fa12345678abcd1234efgh"
 *                 client Revenue:
 *                   type: number
 *                   example: 5400
 *       404:
 *         description: User not found
 */
router.get("/revenue/:clientId", protect, getClientRevenue);

/**
 * @swagger
 * /api/analytics/stock:
 *   get:
 *     summary: Get stock report
 *     description: Returns a list of products and their stock levels.
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with stock report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Laptop"
 *                       stock:
 *                         type: number
 *                         example: 25
 *       500:
 *         description: Server error
 */
router.get("/stock", protect, getStockReport);

export default router;
