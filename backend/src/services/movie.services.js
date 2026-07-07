import Movie from "../models/movie.model.js";
import ApiError from "../errors/Apierror.js";

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
