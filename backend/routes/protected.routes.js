import express from "express";
import { authenticate } from "../middleware/auth.js";
import { dashboard } from "../controllers/dashboard.controller.js";
const router = express.Router();

router.get('/dashboard', authenticate, dashboard)

export { router as protectedRouter };