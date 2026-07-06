import multer from "multer";
import path from "path";
import ApiError from "../errors/Apierror.js";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/avatars/");
    },
    filename: (req, file, cb) => {
        const unique = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, unique);
    },
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new ApiError(400, "Only image files are allowed!"), false);
    }
};

const upload = multer({
    storage, fileFilter, limits: { fileSize: 1024 * 1024 * 2 },
});

export default upload;