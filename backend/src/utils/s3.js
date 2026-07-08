import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand,
    CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";
import fs from "fs";

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET = process.env.AWS_BUCKET_NAME;

export const uploadToS3 = async (file, folder) => {
    const ext = path.extname(file.originalname);
    const key = `${folder}/${file.originalname.replace(ext, "")}-${Date.now()}${ext}`;

    await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    }));

    const url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return { key, url };
};

// ---- Presigned / multipart direct-to-S3 upload helpers ----

const PRESIGN_EXPIRES = 60 * 60; // 1 hour

// Build a unique, path-safe object key inside a folder.
const buildKey = (folder, originalName) => {
    const ext = path.extname(originalName || "");
    const base = path
        .basename(originalName || "file", ext)
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .slice(0, 80) || "file";
    return `${folder}/${base}-${Date.now()}${ext}`;
};

export const publicUrlForKey = (key) =>
    `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

// Presigned GET URL so the browser can read a private object directly
// (thumbnails, and range-based video playback).
export const getPresignedGetUrl = async (key, expiresIn = PRESIGN_EXPIRES) => {
    return getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: BUCKET, Key: key }),
        { expiresIn }
    );
};

// Single presigned PUT (used for thumbnails / small files).
export const getPresignedPutUrl = async (originalName, contentType, folder) => {
    const key = buildKey(folder, originalName);
    const url = await getSignedUrl(
        s3,
        new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
        { expiresIn: PRESIGN_EXPIRES }
    );
    return { key, url };
};

// Start a multipart upload (used for large videos).
export const createMultipartUpload = async (originalName, contentType, folder) => {
    const key = buildKey(folder, originalName);
    const { UploadId } = await s3.send(
        new CreateMultipartUploadCommand({ Bucket: BUCKET, Key: key, ContentType: contentType })
    );
    return { key, uploadId: UploadId };
};

// Presigned URLs for each part number [1..partCount].
export const getMultipartPartUrls = async (key, uploadId, partCount) => {
    const urls = await Promise.all(
        Array.from({ length: partCount }, (_, i) => i + 1).map(async (partNumber) => {
            const url = await getSignedUrl(
                s3,
                new UploadPartCommand({
                    Bucket: BUCKET,
                    Key: key,
                    UploadId: uploadId,
                    PartNumber: partNumber,
                }),
                { expiresIn: PRESIGN_EXPIRES }
            );
            return { partNumber, url };
        })
    );
    return urls;
};

// Finalize the multipart upload. `parts` = [{ ETag, PartNumber }].
export const completeMultipartUpload = async (key, uploadId, parts) => {
    const ordered = [...parts].sort((a, b) => a.PartNumber - b.PartNumber);
    await s3.send(
        new CompleteMultipartUploadCommand({
            Bucket: BUCKET,
            Key: key,
            UploadId: uploadId,
            MultipartUpload: { Parts: ordered },
        })
    );
    return { key, url: publicUrlForKey(key) };
};

export const abortMultipartUpload = async (key, uploadId) => {
    await s3.send(
        new AbortMultipartUploadCommand({ Bucket: BUCKET, Key: key, UploadId: uploadId })
    );
};

export const uploadToS3Stream = async (filePath, originalName, mimeType, folder) => {
    const stream = fs.createReadStream(filePath);
    const key = `${folder}/${Date.now()}${path.extname(originalName)}`;

    const command = new PutObjectCommand({

    Bucket: process.env.AWS_BUCKET_NAME,

    Key: key,

    Body: stream,

    ContentType: mimeType,

});
    await s3.send(command);

    fs.unlinkSync(filePath);

    return {
        key,
        url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
    
};

export const deleteFromS3 = async (key) => {
    await s3.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    }));
};

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB

export const getVideosStream = async (key, range) => {
    const metadata = await s3.send(
        new HeadObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
        })
    );

    const fileSize = metadata.ContentLength;

    const start =
        Number(
            range
                ?.replace(
                    /\D/g,
                    ""
                )
        ) || 0;

    const end =
        Math.min(
            start +
            CHUNK_SIZE -
            1,

            fileSize - 1
        );

    const response = await s3.send(
        new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            Range: `bytes=${start}-${end}`,
        })
    );

    return {
        stream: response.Body,
        start,
        end,
        fileSize,
        contentType: metadata.ContentType,
    };
}
