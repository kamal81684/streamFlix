import Movie from "../models/movie.model.js";
import WatchHistory from "../models/watchHistory.model.js";
import ApiError from "../errors/Apierror.js";
import { uploadToS3Stream, getVideosStream, deleteFromS3 } from "../utils/s3.js";

export const createMovieService = async (
    movieData
) => {

    const movie =
        await Movie.create(movieData);

    return movie;

};

export const getAllMoviesServices = async () => {
    const movies = await Movie.find()
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

    return movies;
};

export const getMovieByIdService = async (id) => {
    const movie = await Movie.findById(id)
        .populate("createdBy", "name email")
        .lean();

    return movie;
};

export const publishMovieService = async (id) => {
    return await Movie.findByIdAndUpdate(
        id,
        {
            isPublished: true,
        },
        {
            new: true,
            runValidators: true,
        }
    );
};

export const unpublishMovieService = async (id) => {
    return await Movie.findByIdAndUpdate(
        id,
        {
            isPublished: false,
        },
        {
            new: true,
            runValidators: true,
        }
    );
};


export const uploadMovieThumbnailService = async (
    movieId,
    thumbnail
) => {

    const movie = await Movie.findByIdAndUpdate(
        movieId,
        {
            thumbnail,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!movie) {
        throw new ApiError(404, "Movie not found");
    }

    return movie;
};

export const getPublicMoviesService = async (query) => {
    const {
        page = 1,
        limit = 12,
        genre,
        search,
        sort = "latest",
    } = query;

    const filter = { isPublished: true };

    if (genre) {
        filter.genre = { $in: [genre] };
    }

    if (search) {
        filter.title = {
            $regex: search,
            $options: "i",
        };
    }

    let sortOption;

    switch (sort) {
        case "latest":
            sortOption = { createdAt: -1 };
            break;
        case "oldest":
            sortOption = { createdAt: 1 };
            break;
        case "title":
            sortOption = { title: 1 };
            break;
        default:
            sortOption = { createdAt: -1 };
    }

    const movies = await Movie.find(filter)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean();

    const total = await Movie.countDocuments(filter);

    return {
        movies,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
    };
};

export const featureMovieService = async (movieId) => {

    await Movie.updateMany(
        {},
        {
            isFeatured: false,
        }
    );

    const movie = await Movie.findByIdAndUpdate(
        movieId,
        {
            isFeatured: true,
        },
        {
            new: true,
        }
    );

    if (!movie) {
        throw new ApiError(404, "Movie not found");
    }

    return movie;
};

export const unfeatureMovieService = async (movieId) => {

    const movie = await Movie.findByIdAndUpdate(
        movieId,
        {
            isFeatured: false,
        },
        {
            new: true,
        }
    );

    if (!movie) {
        throw new ApiError(404, "Movie not found");
    }

    return movie;
};

export const getFeaturedMovieService = async () => {

    const movie = await Movie.findOne({
        isPublished: true,
        isFeatured: true,
    }).lean();

    return movie;
};

export const getLatestMoviesService = async () => {

    const movies = await Movie.find({
        isPublished: true,
    })
        .sort({
            releaseYear: -1,
            createdAt: -1,
        })
        .limit(10)
        .lean();

    return movies;
};

export const getSimilarMoviesService = async (movieId) => {

    const movie = await Movie.findById(movieId);

    if (!movie) {
        throw new ApiError(
            404,
            "Movie not found"
        );
    }

    const similarMovies = await Movie.find({

        _id: {
            $ne: movie._id,
        },

        isPublished: true,

        genre: {
            $in: movie.genre,
        },

    })
        .limit(10)
        .lean();

    return similarMovies;
};

export const getGenresService = async () => {

    const genres = await Movie.distinct(
        "genre",
        {
            isPublished: true,
        }
    );

    return genres.sort();

};

export const uploadMovieVideoService = async (
    movieId,
    file
) => {
    const movie = await Movie.findById(movieId);

    if (!movie) {
        throw new ApiError(404, "Movie not found");
    }

    const oldVideo = movie.video;

    const uploaded = await uploadToS3Stream(
        file.path,
        file.originalname,
        file.mimetype,
        "videos"
    );

    movie.video = {
        key: uploaded.key,
        url: uploaded.url,
        size: file.size,
        mimeType: file.mimetype,
        duration: 0,
    };
    await movie.save();

    if (oldVideo?.key) {

        try {

            await deleteFromS3(oldVideo.key);

        } catch (error) {

            console.error(
                "Failed to delete old video:",
                error
            );

        }

    }

    return movie;
}

// Attach an already-uploaded (direct-to-S3) video to a movie and
// clean up the previously stored object, if any.
export const setMovieVideoService = async (movieId, video) => {
    const movie = await Movie.findById(movieId);

    if (!movie) {
        throw new ApiError(404, "Movie not found");
    }

    const oldVideo = movie.video;

    movie.video = {
        key: video.key,
        url: video.url,
        size: video.size || 0,
        mimeType: video.mimeType,
        duration: 0,
    };
    await movie.save();

    if (oldVideo?.key && oldVideo.key !== video.key) {
        try {
            await deleteFromS3(oldVideo.key);
        } catch (error) {
            console.error("Failed to delete old video:", error);
        }
    }

    return movie;
};

export const streamMovieService = async (
    movieId,
    range
) => {
    const movie = await Movie.findById(movieId);

    if (!movie) {
        throw new ApiError(
            404,
            "Movie not found"
        );
    }

    if (!movie.video?.key) {
        throw new ApiError(
            404,
            "Video not uploaded"
        );
    }

    const streamData =
        await getVideosStream(
            movie.video.key,
            range
        );

    return streamData;

};

export const getContinueWatchingService = async (userId) => {

    return await WatchHistory.find({
        user: userId,
        completed: false,
        progress: { $gt: 0 },
    })
        .populate({
            path: "movie",
        })
        .sort({
            watchedAt: -1,
        })
        .limit(10)
        .lean();

};