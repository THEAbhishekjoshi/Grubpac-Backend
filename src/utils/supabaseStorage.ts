import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";

const s3Client = new S3Client({
    forcePathStyle: true,
    region: process.env.BUCKET_REGION || "",// Use your Supabase region
    endpoint: `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co/storage/v1/s3`,
    credentials: {
        accessKeyId: process.env.SUPABASE_ACCESS_KEY || "",
        secretAccessKey: process.env.SUPABASE_SECRET_KEY || "",
    },
})

export const uploadToSupabase = async (file: Express.Multer.File) => {
    const fileName = `${Date.now()}-${path.basename(file.originalname)}`
    const bucketName = "content-files"

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
    })

    await s3Client.send(command)

    // Return the public URL or file path
    // Format: https://[ref].supabase.co/storage/v1/object/public/[bucket]/[filename]
    return {
        path: fileName,
        url: `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${bucketName}/${fileName}`
    }
}