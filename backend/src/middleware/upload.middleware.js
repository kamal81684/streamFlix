import multer from "multer";
import ApiError from "../errors/Apierror.js";
import path from "path";
import fs from "fs";

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

const videoStorage = multer.diskStorage({

    destination: (req, file, cb) => {

        const dir = "uploads/videos";

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },

    filename: (req, file, cb) => {

        const uniqueName =
            `${Date.now()}${path.extname(file.originalname)}`;

        cb(null, uniqueName);
    },

});

const videoFilter = (req, file, cb) => {

    if (
        file.mimetype.startsWith("video/")
    ) {
        cb(null, true);
    } else {
        cb(
            new ApiError(
                400,
                "Only video files are allowed."
            ),
            false
        );
    }

};

export const uploadVideo = multer({

    storage: videoStorage,

    fileFilter: videoFilter,

    limits: {
        fileSize:
            5 * 1024 * 1024 * 1024,
    },

});