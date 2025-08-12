import express from 'express';
const router = express.Router();

import { addActivities, addTrip, addStops, deleteTrip, updateTrip, deleteStopsByTrip, deleteActivitiesByTrip, bookPredefinedItinerary } from '../controllers/trip.controller.js';

router.post('/', addTrip);
router.post('/book-predefined', bookPredefinedItinerary);
router.put('/:tripId', updateTrip);
router.post('/stops', addStops);
router.post('/activities', addActivities);
router.delete('/:tripId', deleteTrip);
router.delete('/:tripId/stops', deleteStopsByTrip);
router.delete('/:tripId/activities', deleteActivitiesByTrip);

export { router as tripRouter };