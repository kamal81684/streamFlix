import {
    createMovieService,
    getAllMoviesServices,
    getMovieByIdService,
    publishMovieService,
    unpublishMovieService,
    uploadMovieThumbnailService,
    getPublicMoviesService,
} from "../services/movie.services.js";

import ApiError from "../errors/Apierror.js";
import { uploadToS3 } from "../utils/s3.js";


export const createMovie = async (req, res, next) => {
    try {

        const movieData = {
            ...req.body,
            createdBy: req.user.id,
        };

        const movie =
            await createMovieService(movieData);

        return res.status(201).json({
            success: true,
            message: "Movie created successfully",
            movie,
        });

    } catch (error) {
        next(error);
    }
};

export const getAllMovies = async (
    req,
    res,
    next
) => {
    try {

        const movies =
            await getAllMoviesServices();

        return res.status(200).json({
            success: true,
            count: movies.length,
            movies,
        });

    } catch (error) {
        next(error);
    }
};

export const getMovieById = async (req, res, next) => {
    try {
        const movie = await getMovieByIdService(req.params.id);

        if (!movie) {
            throw new ApiError(404, "Movie not found");
        }

        return res.status(200).json({
            success: true,
            movie,
        });
    } catch (error) {
        next(error);
    }
};

export const publishMovie = async (req, res, next) => {
    try {

        const movie =
            await publishMovieService(req.params.id);

        if (!movie) {
            throw new ApiError(404, "Movie not found");
        }

        return res.status(200).json({
            success: true,
            message: "Movie published successfully",
            movie,
        });

    } catch (error) {
        next(error);
    }
};

export const unpublishMovie = async (req, res, next) => {
    try {

        const movie =
            await unpublishMovieService(req.params.id);

        if (!movie) {
            throw new ApiError(404, "Movie not found");
        }

        return res.status(200).json({
            success: true,
            message: "Movie unpublished successfully",
            movie,
        });

    } catch (error) {
        next(error);
    }
};

export const uploadMovieThumbnail = async (
    req,
    res,
    next
) => {
    try {

        if (!req.file) {
            throw new ApiError(
                400,
                "Thumbnail is required"
            );
        }

        const { key, url } = await uploadToS3(
            req.file,
            "thumbnails"
        );

        const movie =
            await uploadMovieThumbnailService(
                req.params.id,
                { key, url }
            );

        return res.status(200).json({
            success: true,
            message:
                "Thumbnail uploaded successfully",
            movie,
        });

    } catch (error) {
        next(error);
    }
};

export const getPublicMovieById = async (req, res, next) => {
    try {
        const movie = await getMovieByIdService(req.params.id);

        if (!movie || !movie.isPublished) {
            throw new ApiError(404, "Movie not found");
        }

        return res.status(200).json({
            success: true,
            movie,
        });
    } catch (error) {
        next(error);
    }
};

export const getPublicMovies = async (
    req,
    res,
    next
) => {
    try {

        const result =
            await getPublicMoviesService(
                req.query
            );

        return res.status(200).json({
            success: true,
            ...result,
        });

    } catch (error) {
        next(error);
    }
};

export const featureMovie = async (req, res, next) => {
    try {

        const movie = await featureMovieService(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Movie featured successfully",
            movie,
        });

    } catch (error) {
        next(error);
    }
};

export const unfeatureMovie = async (req, res, next) => {
    try {

        const movie = await unfeatureMovieService(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Movie unfeatured successfully",
            movie,
        });

    } catch (error) {
        next(error);
    }
};

export const getFeaturedMovie = async (req, res, next) => {
    try {

        const movie = await getFeaturedMovieService();

        return res.status(200).json({
            success: true,
            movie,
        });

    } catch (error) {
        next(error);
    }
};

