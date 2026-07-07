import express from "express";
import { getProfile, updateProfile, changePassword, uploadAvatar as uploadAvatarHandler } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { uploadAvatar as uploadAvatarMiddleware } from "../middleware/upload.middleware.js";
import { updateProfileValidation } from "../validators/user.validator.js";
import validate from "../middleware/validate.middleware.js";

const router = express.Router();

router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfileValidation, validate, updateProfile);
router.put("/change-password", authenticate, changePassword);
router.put("/avatar", authenticate, uploadAvatarMiddleware.single("avatar"), uploadAvatarHandler);

export default router;