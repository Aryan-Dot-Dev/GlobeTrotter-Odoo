import express from 'express';
import { requireAdmin } from '../middleware/admin.js';
const router = express.Router();

import { 
    getOverviewStats, 
    getPopularDestinations, 
    getPopularActivities, 
    getUserEngagement, 
    getUserManagement 
} from '../controllers/analytics.controller.js';

// Analytics routes - all require admin access
router.get('/overview', requireAdmin, getOverviewStats);
router.get('/destinations', requireAdmin, getPopularDestinations);
router.get('/activities', requireAdmin, getPopularActivities);
router.get('/engagement', requireAdmin, getUserEngagement);
router.get('/users', requireAdmin, getUserManagement);

export { router as analyticsRouter };
