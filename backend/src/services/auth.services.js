import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import generateAccessToken from "../utils/generateToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import ApiError from "../errors/Apierror.js";

export const registerService = async ({ name, email, password }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });
    return user;
};

export const loginService = async ({ email, password }) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new ApiError(401, "Invalid email or password");
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    return { user, accessToken, refreshToken };
};
