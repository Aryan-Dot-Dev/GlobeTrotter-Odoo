import express from 'express';
import { getUserTrips, getUserProfile, updateUserProfile, getUserStats, getUserTripDetails, makeUserAdmin } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';

const userRouter = express.Router();

// Apply auth middleware to all user routes
userRouter.use(authenticate);

// Get user trips
userRouter.get('/trips', getUserTrips);

// Get specific trip details for the user
userRouter.get('/trips/:tripId', getUserTripDetails);

// Get user profile
userRouter.get('/profile', getUserProfile);

// Update user profile
userRouter.put('/profile', updateUserProfile);

// Get user statistics
userRouter.get('/stats', getUserStats);

// Make user admin (for initial setup - you might want to remove this later)
userRouter.post('/make-admin', makeUserAdmin);

export default userRouter;
