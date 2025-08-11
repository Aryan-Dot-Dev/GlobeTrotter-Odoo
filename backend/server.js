import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { authRouter, protectedRouter } from "./routes/index.js";

const PORT = 3000;

const app = express();
app.use(express.json({limit: '50mb'}));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api/auth', authRouter);
app.use('/api/protected', protectedRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});