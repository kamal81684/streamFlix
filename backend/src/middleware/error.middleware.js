const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((validationError) => validationError.message)
            .join(", ");
    }

    if (err.code === 11000) {
        statusCode = 409;

        const duplicateField = Object.keys(err.keyValue || {})[0];
        message = duplicateField
            ? `${duplicateField} already exists`
            : "Duplicate value already exists";
    }

    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}`;
    }

    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }

    return res.status(statusCode).json({
        success: false,
        message,
    });
};

export default errorHandler;