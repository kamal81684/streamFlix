import { body } from "express-validator";

export const updateProgressValidator = [

    body("movieId")
        .notEmpty()
        .withMessage("Movie ID is required")
        .isMongoId()
        .withMessage("Invalid movie ID"),

    body("lastPosition")
        .isNumeric()
        .withMessage("Last position must be a number")
        .custom(value => value >= 0),

    body("duration")
        .isNumeric()
        .withMessage("Duration must be a number")
        .custom(value => value > 0),

];