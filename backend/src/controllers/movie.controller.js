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
    setMovieVideoService,
    streamMovieService,
    getContinueWatchingService,
} from "../services/movie.services.js";

import ApiError from "../errors/Apierror.js";
import {
    uploadToS3,
    getPresignedPutUrl,
    publicUrlForKey,
    createMultipartUpload,
    getMultipartPartUrls,
    completeMultipartUpload,
    abortMultipartUpload,
} from "../utils/s3.js";
import { signMovieMedia, signMoviesMedia } from "../utils/signMovie.js";


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

        const movies = await signMoviesMedia(
            await getAllMoviesServices()
        );

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
            movie: await signMovieMedia(movie),
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
            movie: await signMovieMedia(movie),
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

        result.movies = await signMoviesMedia(result.movies);

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
            movie: await signMovieMedia(movie),
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

        const movies = await signMoviesMedia(
            await getLatestMoviesService()
        );

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

        const movies = await signMoviesMedia(
            await getSimilarMoviesService(
                req.params.id
            )
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

// ---- Presigned / direct-to-S3 upload flow ----

const MAX_PARTS = 10000; // S3 hard limit

// 1a. Thumbnail: hand back a single presigned PUT URL.
export const getThumbnailUploadUrl = async (req, res, next) => {
    try {
        const { fileName, fileType } = req.body;

        if (!fileType || !fileType.startsWith("image/")) {
            throw new ApiError(400, "Only image files are allowed");
        }

        // Ensure the movie exists before minting an upload URL.
        await getMovieByIdService(req.params.id);

        const { key, url } = await getPresignedPutUrl(
            fileName || "thumbnail",
            fileType,
            "thumbnails"
        );

        return res.status(200).json({ success: true, key, url });
    } catch (error) {
        next(error);
    }
};

// 1b. Thumbnail: persist the uploaded object onto the movie.
export const confirmThumbnailUpload = async (req, res, next) => {
    try {
        const { key } = req.body;

        if (!key) {
            throw new ApiError(400, "key is required");
        }

        const movie = await uploadMovieThumbnailService(req.params.id, {
            key,
            url: publicUrlForKey(key),
        });

        return res.status(200).json({
            success: true,
            message: "Thumbnail uploaded successfully",
            movie,
        });
    } catch (error) {
        next(error);
    }
};

// 2a. Video: start a multipart upload and return presigned part URLs.
export const initiateVideoUpload = async (req, res, next) => {
    try {
        const { fileName, fileType, partCount } = req.body;

        if (!fileType || !fileType.startsWith("video/")) {
            throw new ApiError(400, "Only video files are allowed");
        }

        const parts = Number(partCount);
        if (!Number.isInteger(parts) || parts < 1 || parts > MAX_PARTS) {
            throw new ApiError(400, `partCount must be between 1 and ${MAX_PARTS}`);
        }

        await getMovieByIdService(req.params.id);

        const { key, uploadId } = await createMultipartUpload(
            fileName || "video",
            fileType,
            "videos"
        );

        const urls = await getMultipartPartUrls(key, uploadId, parts);

        return res.status(200).json({ success: true, key, uploadId, parts: urls });
    } catch (error) {
        next(error);
    }
};

// 2b. Video: finalize the multipart upload and attach it to the movie.
export const completeVideoUpload = async (req, res, next) => {
    try {
        const { key, uploadId, parts, size, mimeType } = req.body;

        if (!key || !uploadId || !Array.isArray(parts) || parts.length === 0) {
            throw new ApiError(400, "key, uploadId and parts are required");
        }

        const normalized = parts.map((p) => ({
            ETag: p.ETag ?? p.etag,
            PartNumber: Number(p.PartNumber ?? p.partNumber),
        }));

        if (normalized.some((p) => !p.ETag || !Number.isInteger(p.PartNumber))) {
            throw new ApiError(400, "Each part needs an ETag and PartNumber");
        }

        const { url } = await completeMultipartUpload(key, uploadId, normalized);

        const movie = await setMovieVideoService(req.params.id, {
            key,
            url,
            size,
            mimeType,
        });

        return res.status(200).json({
            success: true,
            message: "Video uploaded successfully",
            movie,
        });
    } catch (error) {
        next(error);
    }
};

// 2c. Video: abort a multipart upload (cleanup on client failure/cancel).
export const abortVideoUpload = async (req, res, next) => {
    try {
        const { key, uploadId } = req.body;

        if (!key || !uploadId) {
            throw new ApiError(400, "key and uploadId are required");
        }

        await abortMultipartUpload(key, uploadId);

        return res.status(200).json({ success: true, message: "Upload aborted" });
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

        const history =
            await getContinueWatchingService(
                req.user._id
            );

        const movies = await Promise.all(
            history.map(async (item) => ({
                ...item,
                movie: await signMovieMedia(item.movie),
            }))
        );

        return res.status(200).json({
            success: true,
            movies,
        });

    } catch(error) {

        next(error);

    }

};