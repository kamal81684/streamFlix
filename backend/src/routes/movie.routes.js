import express from "express";
const router = express.Router();

import {
    createMovie,
    getAllMovies,
    getMovieById,
    publishMovie,
    unpublishMovie,
    uploadMovieThumbnail,
    getPublicMovies,
    getPublicMovieById,
    featureMovie,
    unfeatureMovie,
    getFeaturedMovie,
} from "../controllers/movie.controller.js";

import { createMovieValidation } from "../validators/movie.validator.js";

import validate from "../middleware/validate.middleware.js";

import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { uploadThumbnail } from "../middleware/upload.middleware.js";

// Public routes (must be before /:id)
router.get(
    "/public",
    getPublicMovies
);

router.get(
    "/public/:id",
    getPublicMovieById
);

// Admin routes
router.post(
    "/",
    authenticate,
    authorize("admin"),
    createMovieValidation,
    validate,
    createMovie
);

router.get(
    "/",
    authenticate,
    authorize("admin"),
    getAllMovies
);

router.get(
    "/:id",
    authenticate,
    authorize("admin"),
    getMovieById
);

router.patch(
    "/:id/publish",
    authenticate,
    authorize("admin"),
    publishMovie
);

router.patch(
    "/:id/unpublish",
    authenticate,
    authorize("admin"),
    unpublishMovie
);

router.patch(
    "/:id/thumbnail",
    authenticate,
    authorize("admin"),
    uploadThumbnail.single("thumbnail"),
    uploadMovieThumbnail
);

router.patch(
    "/:id/feature",
    authenticate,
    authorize("admin"),
    featureMovie
);

router.patch(
    "/:id/unfeature",
    authenticate,
    authorize("admin"),
    unfeatureMovie
);

router.get(
    "/featured",
    getFeaturedMovie
);

export default router;
