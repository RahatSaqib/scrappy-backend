import { S3 } from "@aws-sdk/client-s3";

const s3Client = new S3({
    forcePathStyle: false, // Configures to use subdomain/virtual calling format.
    // endpoint: process.env.S3_ENDPOINT,
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.DO_S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.DO_S3_SECRET_ACCESS_KEY || ''
    }
});

export { s3Client };