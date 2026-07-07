import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import ApiError from "../errors/Apierror.js";
import { uploadToS3 } from "../utils/s3.js";

export const getProfile = async (req, res) => {

    return res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            avatar: req.user.avatar,
        },
    });

};

export const updateProfile = async (req, res, next) => {
    const {name, email} = req.body;
    try {
        const update = await User.findByIdAndUpdate(
            req.user._id,
            {name, email}, 
            {new: true, runValidators: true}
        ).select("-password");

        res.status(200).json({
            success: true,
            user: update,
        });
    }catch (error) {
        next(error);
    }
}

export const changePassword = async (req, res, next) => {
    try{
        const {currentPassword, newPassword} = req.body;
        const user = await User.findById(req.user._id);
        const isMatch = await user.comparePassword(currentPassword);
        if(!isMatch) {
            throw new ApiError(400, "Current password is incorrect");
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    }catch (error) {
        next(error);
    }
}

export const uploadAvatar = async (req, res, next) => {
    try {
        if(!req.file) throw new ApiError(400, "No file uploaded");
        const { url } = await uploadToS3(req.file, "avatars");
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {avatar: url},
            {new: true}
        ).select("-password");
        res.status(200).json({
            success: true,
            user,
        });
    }catch (error) {
        next(error);
    }
}