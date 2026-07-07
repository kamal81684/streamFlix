import multer from "multer";
import ApiError from "../errors/Apierror.js";

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new ApiError(400, "Only image files are allowed"), false);
    }
};

export const uploadAvatar = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
});

export const uploadThumbnail = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
