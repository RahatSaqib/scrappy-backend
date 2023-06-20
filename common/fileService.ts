import { v4 as uniqueID } from 'uuid';
import { GetObjectAclCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../config/s3Client';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';


export const uploadFileToAWS = async (buffer: any, fileName: string): Promise<any> => {

    try {

        const bucketParams = {
            Bucket: process.env.S3_BUCKET,
            Key: `${uniqueID()}-${fileName}`,
            Body: buffer,
            ACL: 'public-read',

        };
        await s3Client.send(new PutObjectCommand(bucketParams));
        const url = await getSignedUrl(s3Client, new GetObjectAclCommand(bucketParams), { expiresIn: 200 * 60 }); // Adjustable expiration.

        return {

            filekey: bucketParams.Key,
            fileUrl: url,
            fileSize: buffer.length,
            fileName
        }

    } catch (err) {
        console.log("Error", err);
        throw new Error('Failed to upload file to S3');
    }
}