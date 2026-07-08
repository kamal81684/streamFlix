import { getPresignedGetUrl } from "./s3.js";

// The media bucket is private, so the stored `url` fields (plain S3 URLs)
// 403 in the browser. Swap them for short-lived presigned GET URLs at
// response time so the client can load thumbnails and stream video directly.
export const signMovieMedia = async (movie) => {
    if (!movie) return movie;

    const obj = typeof movie.toObject === "function" ? movie.toObject() : movie;

    if (obj.thumbnail?.key) {
        obj.thumbnail = {
            ...obj.thumbnail,
            url: await getPresignedGetUrl(obj.thumbnail.key),
        };
    }

    if (obj.video?.key) {
        obj.video = {
            ...obj.video,
            url: await getPresignedGetUrl(obj.video.key),
        };
    }

    return obj;
};

export const signMoviesMedia = (movies) =>
    Promise.all((movies || []).map((m) => signMovieMedia(m)));
