import { body } from "express-validator";

export const createMovieValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 2, max: 200 })
    .withMessage("Title must be between 2 and 200 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 20, max: 2000 })
    .withMessage("Description must be between 20 and 2000 characters"),

  body("genre")
    .isArray({ min: 1 })
    .withMessage("At least one genre is required"),

  body("genre.*")
    .trim()
    .notEmpty()
    .withMessage("Genre cannot be empty"),

  body("language")
    .trim()
    .notEmpty()
    .withMessage("Language is required"),

  body("duration")
    .isInt({ min: 1 })
    .withMessage("Duration must be greater than 0 minutes"),

  body("releaseYear")
    .isInt({
      min: 1888,
      max: new Date().getFullYear() + 2,
    })
    .withMessage("Invalid release year"),

  body("director")
    .trim()
    .notEmpty()
    .withMessage("Director is required"),

  body("cast")
    .isArray({ min: 1 })
    .withMessage("At least one cast member is required"),

  body("cast.*")
    .trim()
    .notEmpty()
    .withMessage("Cast member name cannot be empty"),

  body("maturityRating")
    .optional()
    .isIn([
      "U",
      "U/A 7+",
      "U/A 13+",
      "U/A 16+",
      "A",
    ])
    .withMessage("Invalid maturity rating"),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array"),

  body("tags.*")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Tag cannot be empty"),

  body("thumbnail")
    .optional()
    .isString()
    .withMessage("Thumbnail must be a string"),
];