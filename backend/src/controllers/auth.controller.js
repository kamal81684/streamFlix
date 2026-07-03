import { registerService, loginService } from "../services/auth.services.js";
import jwt from "jsonwebtoken";
import generateAccessToken from "../utils/generateToken.js";
import ApiError from "../errors/Apierror.js";

export const registerUser = async (req, res, next) => {
    try {
        const user = await registerService(req.body);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const loginUser = async (req, res, next) => {
    try {
        const { user, accessToken, refreshToken } = await loginService(req.body);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const refreshToken = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            throw new ApiError(401, "Refresh token not found");
        }

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const newAccessToken = generateAccessToken(decoded.id, decoded.role);

        res.status(200).json({
            success: true,
            accessToken: newAccessToken,
        });
    } catch (error) {
        next(error);
    }
};

export const logoutUser = async (req, res, next) => {
    try {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });

        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        next(error);
    }
};
