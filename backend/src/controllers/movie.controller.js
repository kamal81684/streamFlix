import {
    createMovieService,
    getAllMoviesServices,
    getMovieByIdService,
    publishMovieService,
    unpublishMovieService,
    uploadMovieThumbnailService,
    getPublicMoviesService,
    featureMovieService,
    unfeatureMovieService,
    getFeaturedMovieService,
    getLatestMoviesService,
    getGenresService,
    getSimilarMoviesService,
    uploadMovieVideoService,
    streamMovieService,
    getContinueWatchingService,
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

export const getLatestMovies = async (
    req,
    res,
    next
) => {

    try {

        const movies =
            await getLatestMoviesService();

        return res.status(200).json({
            success: true,
            movies,
        });

    } catch (error) {
        next(error);
    }

};

export const getGenres = async (
    req,
    res,
    next
) => {
    try {

        const genres =
            await getGenresService();

        return res.status(200).json({
            success: true,
            genres,
        });

    } catch (error) {
        next(error);
    }
};

export const getSimilarMovies = async (
    req,
    res,
    next
) => {

    try {

        const movies =
            await getSimilarMoviesService(
                req.params.id
            );

        return res.status(200).json({
            success: true,
            movies,
        });

    } catch (error) {
        next(error);
    }

};

export const uploadMovieVideo = async (
    req,
    res,
    next
) => {

    try {

        if (!req.file) {
            throw new ApiError(
                400,
                "Video is required"
            );
        }

        const movie =
            await uploadMovieVideoService(
                req.params.id,
                req.file
            );

        return res.status(200).json({
            success: true,
            message:
                "Video uploaded successfully",
            movie,
        });

    } catch (error) {
        next(error);
    }

};

export const streamMovie = async (
    req,
    res,
    next
) => {

    try {

        const range =
            req.headers.range;

        if (!range) {
            throw new ApiError(
                400,
                "Range header is required."
            );
        }

        const video =
            await streamMovieService(
                req.params.id,
                range
            );

        res.writeHead(206, {

            "Content-Range":
`bytes ${video.start}-${video.end}/${video.fileSize}`,

            "Accept-Ranges":
"bytes",

            "Content-Length":
video.end -
video.start +
1,

            "Content-Type":
video.contentType,

        });

        video.stream.pipe(res);

    } catch(error) {

        next(error);

    }

};

export const updateWatchProgress = async (
    req,
    res,
    next
) => {

};

export const getContinueWatching = async (
    req,
    res,
    next
) => {

    try {

        const movies =
            await getContinueWatchingService(
                req.user._id
            );

        return res.status(200).json({
            success: true,
            movies,
        });

    } catch(error) {

        next(error);

    }

};