import axios from "axios";
import {
  presignThumbnail,
  confirmThumbnail,
  initiateVideoUpload,
  completeVideoUpload,
  abortVideoUpload,
  PresignedPart,
  CompletedPart,
} from "@/services/upload.api";

// S3 multipart parts must be >= 5 MiB (except the final part). 10 MiB is a
// safe default that keeps the part count well under the 10,000 limit.
const CHUNK_SIZE = 10 * 1024 * 1024;
const CONCURRENCY = 3;

type ProgressFn = (percent: number) => void;

/**
 * Wrap a progress callback so it only fires when the whole-number percent
 * changes. XHR upload events fire hundreds of times per chunk; without this,
 * parallel chunks flood React with thousands of setState calls per second,
 * saturating the main thread and crashing the tab.
 */
function throttleProgress(onProgress?: ProgressFn): ProgressFn {
  let last = -1;
  return (percent: number) => {
    const p = Math.max(0, Math.min(100, Math.round(percent)));
    if (p !== last) {
      last = p;
      onProgress?.(p);
    }
  };
}

/**
 * Thumbnail: single presigned PUT straight to S3, then confirm to the backend.
 * Small files don't need multipart.
 */
export async function uploadThumbnailDirect(
  movieId: string,
  file: File,
  onProgress?: ProgressFn
) {
  const report = throttleProgress(onProgress);
  const { data } = await presignThumbnail(movieId, file.name, file.type);

  await axios.put(data.url, file, {
    // The URL was signed with this Content-Type, so it must be sent back.
    headers: { "Content-Type": file.type },
    onUploadProgress: (e) => {
      if (e.total) report((e.loaded / e.total) * 100);
    },
  });

  const res = await confirmThumbnail(movieId, data.key);
  onProgress?.(100);
  return res.data.movie;
}

/**
 * Video: S3 multipart upload. The browser uploads each chunk directly to S3
 * using presigned URLs, then the backend finalizes and records the object.
 */
export async function uploadVideoDirect(
  movieId: string,
  file: File,
  onProgress?: ProgressFn
) {
  const size = file.size;
  const partCount = Math.max(1, Math.ceil(size / CHUNK_SIZE));
  const report = throttleProgress(onProgress);

  const { data } = await initiateVideoUpload(
    movieId,
    file.name,
    file.type,
    partCount
  );

  const { key, uploadId } = data;
  const parts: PresignedPart[] = data.parts;

  // Track bytes uploaded per part so overall progress is accurate even with
  // parallel uploads.
  const loaded = new Array<number>(partCount).fill(0);
  const completed = new Array<CompletedPart>(partCount);

  const reportProgress = () => {
    if (!size) return;
    let total = 0;
    for (let j = 0; j < loaded.length; j++) total += loaded[j];
    // Cap at 99% until the backend confirms completion.
    report(Math.min(99, (total / size) * 100));
  };

  try {
    let cursor = 0;
    const uploadNext = async (): Promise<void> => {
      while (cursor < parts.length) {
        const i = cursor++;
        const { partNumber, url } = parts[i];
        const start = (partNumber - 1) * CHUNK_SIZE;
        const blob = file.slice(start, Math.min(start + CHUNK_SIZE, size));

        const resp = await axios.put(url, blob, {
          // Bounded, streamed straight from disk by the browser; the throttled
          // reporter keeps the progress events from flooding React.
          onUploadProgress: (e) => {
            loaded[i] = e.loaded;
            reportProgress();
          },
        });

        const etag = resp.headers.etag || resp.headers.ETag;
        if (!etag) {
          throw new Error(
            "Missing ETag from S3 (check bucket CORS ExposeHeaders)"
          );
        }
        completed[i] = { ETag: etag, PartNumber: partNumber };
        loaded[i] = blob.size;
        reportProgress();
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, partCount) }, uploadNext)
    );

    const res = await completeVideoUpload(movieId, {
      key,
      uploadId,
      parts: completed,
      size: file.size,
      mimeType: file.type,
    });

    onProgress?.(100);
    return res.data.movie;
  } catch (err) {
    // Best-effort cleanup so we don't leave dangling multipart uploads in S3.
    try {
      await abortVideoUpload(movieId, key, uploadId);
    } catch {
      /* ignore abort failure */
    }
    throw err;
  }
}
