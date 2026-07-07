import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand} from "@aws-sdk/client-s3";
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
