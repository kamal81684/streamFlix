import mongoose from "mongoose";

const watchHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
        required: true,
    },

    lastPosition: Number,

    duration: Number,

    progress: {
        type: Number,
        default: 0,
    },

    completed: {
        type: Boolean,
        default: false,
    },

    watchedAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("WatchHistory", watchHistorySchema);