import express from "express";
const router = express.Router();
import { signup, login, logout, me, upload, uploadAvatar } from "../controllers/auth.controller.js";

router.post('/signup', upload.single('avatar'), signup)
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', me)
router.post('/upload-avatar', upload.single('avatar'), uploadAvatar)

export { router as authRouter };
