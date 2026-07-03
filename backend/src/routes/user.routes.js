import express from "express";
import { getProfile } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/profile", authenticate, getProfile);

export default router;