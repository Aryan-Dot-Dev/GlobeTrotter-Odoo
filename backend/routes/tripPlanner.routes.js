import express from 'express';
import { 
    createTrip, 
    createStop, 
    createActivity, 
    suggestPlaces, 
    suggestActivities, 
    autoSchedule 
} from '../controllers/tripPlanner.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Trip creation routes
router.post('/trips', createTrip);
router.post('/stops', createStop);
router.post('/activities', createActivity);

// AI suggestion routes
router.post('/ai/suggest-places', suggestPlaces);
router.post('/ai/suggest-activities', suggestActivities);
router.post('/ai/auto-schedule', autoSchedule);

export default router;
