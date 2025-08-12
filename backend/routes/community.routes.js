import express from 'express';
import { getPublicTrips, getTripDetails, copyTripToAccount } from '../controllers/community.controller.js';

const router = express.Router();

// Get all public trips for community board
router.get('/trips', getPublicTrips);

// Get detailed view of a specific trip
router.get('/trips/:tripId', getTripDetails);

// Copy a community trip to user's account
router.post('/trips/:tripId/copy', copyTripToAccount);

export default router;
