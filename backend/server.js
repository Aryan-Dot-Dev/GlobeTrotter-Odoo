import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

import { authRouter, protectedRouter, tripPlannerRouter } from "./routes/index.js";
import { tripRouter } from "./routes/trip.routes.js";
import { analyticsRouter } from "./routes/analytics.routes.js";
import communityRouter from "./routes/community.routes.js";
import userRouter from "./routes/user.routes.js";

const PORT = 3000;

const app = express();
app.use(express.json({limit: '50mb'}));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:1404',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api/auth', authRouter);
app.use('/api/trips', tripRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/community', communityRouter);
app.use('/api/user', userRouter);
app.use('/api/protected', protectedRouter);
app.use('/api', tripPlannerRouter);

// Gemini API proxy route
app.post('/api/gemini/suggestions', async (req, res) => {
  try {
    const { contents, generationConfig } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      { contents, generationConfig },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to get suggestions from Gemini API',
      details: error.response?.data || error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});