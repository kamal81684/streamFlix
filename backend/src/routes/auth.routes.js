import express from "express";
import { registerUser, loginUser, refreshToken, logoutUser } from "../controllers/auth.controller.js";
import { registerValidation, loginValidation } from "../validators/auth.validator.js";
import validate from "../middleware/validate.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerValidation, validate, registerUser);
router.post("/login", loginValidation, validate, loginUser);
router.post("/refresh-token", refreshToken);
router.post("/logout", authenticate, logoutUser);

export default router;
