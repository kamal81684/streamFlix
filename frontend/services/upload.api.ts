import api from "@/lib/axios";

// Backend presigned-upload endpoints (admin only).

export interface PresignedPart {
  partNumber: number;
  url: string;
}

export interface CompletedPart {
  ETag: string;
  PartNumber: number;
}

export const presignThumbnail = (id: string, fileName: string, fileType: string) =>
  api.post(`/movies/${id}/thumbnail/presign`, { fileName, fileType });

export const confirmThumbnail = (id: string, key: string) =>
  api.post(`/movies/${id}/thumbnail/confirm`, { key });

export const initiateVideoUpload = (
  id: string,
  fileName: string,
  fileType: string,
  partCount: number
) => api.post(`/movies/${id}/video/initiate`, { fileName, fileType, partCount });

export const completeVideoUpload = (
  id: string,
  payload: {
    key: string;
    uploadId: string;
    parts: CompletedPart[];
    size: number;
    mimeType: string;
  }
) => api.post(`/movies/${id}/video/complete`, payload);

export const abortVideoUpload = (id: string, key: string, uploadId: string) =>
  api.post(`/movies/${id}/video/abort`, { key, uploadId });
