import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3";

export async function createDownloadUrl(key: string) {
    const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
    });

    const url = await getSignedUrl(s3, command, {
        expiresIn: 60 * 5,
    });

    return url;
}

export async function deleteFile(key: string) {
    const command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
    });

    await s3.send(command).catch((err) => {
        console.error("S3 Deletion Error:", err);
    });
}

export async function createUploadUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        ContentType: contentType,
    });

    const url = await getSignedUrl(s3, command, {
        expiresIn: 60 * 5,
    });

    return url;
}