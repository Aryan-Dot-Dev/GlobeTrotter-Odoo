import express from 'express';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();

import { 
    getOverviewStats, 
    getPopularDestinations, 
    getPopularActivities, 
    getUserEngagement, 
    getUserManagement 
} from '../controllers/analytics.controller.js';

// Analytics routes - require authentication only
router.get('/overview', authenticate, getOverviewStats);
router.get('/destinations', authenticate, getPopularDestinations);
router.get('/activities', authenticate, getPopularActivities);
router.get('/engagement', authenticate, getUserEngagement);
router.get('/users', authenticate, getUserManagement);

export { router as analyticsRouter };
