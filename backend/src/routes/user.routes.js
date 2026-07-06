import express from "express";
import { getProfile, updateProfile, changePassword, uploadAvatar } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.put("/change-password", authenticate, changePassword);
router.put("/avatar", authenticate, upload.single("avatar"), uploadAvatar);

export default router;