import { v4 as uniqueID } from 'uuid';
import { GetObjectAclCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../config/s3Client';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs/promises'
import path from 'path'
import { executeQuery, tables } from "../common/common";


/**
* Function for Upload files into S3 bucket
@param buffer: file buffer that will be upload to bucket
@param fileName: fileName that will used on s3 file key
*/

export async function uploadFileToAWS(buffer: any, fileName: string): Promise<any> {

    try {
        const bucketParams = {
            Bucket: process.env.S3_BUCKET, // Bucket name of S3
            Key: `${uniqueID()}-${fileName}`, // Key name of S3 which needs to navigate to image
            Body: buffer,
            ACL: 'public-read', // Make the image publicly readable from any source
        };

        await s3Client.send(new PutObjectCommand(bucketParams)); // Upload the file to s3 bucket
        const url = await getSignedUrl(s3Client, new GetObjectAclCommand(bucketParams), { expiresIn: 200 * 60 }); // Get file url & Adjustable expiration.

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

/**
* Function for load images and upload to db
@param foldername: Folder name of the image we need to read and upload
@param propertyId: the id we can identify where the image belongs to
*/

export async function loadImagesAndUpload(foldername: string, propertyId: number) {
    let folderPath = 'sample_data/' + foldername
    let files = await fs.readdir(folderPath)
    try {
        for await (let file of files) {
            let filepath = path.join(__dirname, '..', 'sample_data', foldername, file)
            let buffer = await fs.readFile(filepath);
            let fileInfo = await uploadFileToAWS(buffer, file)
            let insertQuery = `insert into ${tables.files}
            (name, file_key, file_url, file_size, property_id) 
            values('${fileInfo.fileName}','${fileInfo.filekey}','${fileInfo.fileUrl}','${fileInfo.fileSize}',${propertyId})`
            await executeQuery(insertQuery)
        }
    }
    catch (err) {
        throw err
    }
}
