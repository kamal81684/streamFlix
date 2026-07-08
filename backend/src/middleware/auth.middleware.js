import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ApiError from "../errors/Apierror.js";

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new ApiError(401, "Authorization header is missing");
        }

        if (!authHeader.startsWith("Bearer ")) {
            throw new ApiError(401, "Invalid authorization format");
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            return new ApiError(401, error.message === "jwt expired" ? "Token expired" : "Invalid token");
        }
        next(error);
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(401, "Not authenticated"));
        }
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, "You do not have permission to access this resource"));
        }
        next();
    };
};
