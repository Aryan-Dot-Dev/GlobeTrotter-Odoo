import express from 'express';
import { geminiSuggestions } from '../controllers/gemini.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Gemini API endpoint for suggestions
router.post('/suggestions', authenticate, geminiSuggestions);

export default router;
