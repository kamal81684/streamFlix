// should have a admin id (who uploaded this)
// should have unique title
// description should be there required true
// thumbnail true
import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 200
    },

    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 20,
        maxlength: 2000,
    },

    thumbnail: {
        key: { type: String },
        url: { type: String },
    },

    genre: {
        type: [String],
        required: true,
    },

    language: {
        type: String,
        required: true,
        trim: true,
    },

    isFeatured: {
        type: Boolean,
        default: false,
    },

    duration: {
        type: Number,
        required: true,
        min: 1,
    },

    releaseYear: {
        type: Number,
        required: true,
    },

    director: {
        type: String,
        required: true,
        trim: true,
    },

    cast: {
        type: [String],
        required: true,
    },

    maturityRating: {
        type: String,
        enum: [
            "U",
            "U/A 7+",
            "U/A 13+",
            "U/A 16+",
            "A"
        ],
    },

    tags: {
        type: [String],
        default: [],
    },

    isPublished: {
        type: Boolean,
        default: false,
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
    },

    video: {
        key: String,
        url: String,
        duration: { type: Number, default: 0},
        size: { type: Number, default: 0 },
        mimeType: String,
    },
    
},
    {timestamps: true,}
);

movieSchema.pre("save", function (next) {
    if (this.title && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }
    next();
});

export default mongoose.model(
    "Movie", 
    movieSchema
);