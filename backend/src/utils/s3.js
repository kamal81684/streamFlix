import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";

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
