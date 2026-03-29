import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToR2(buffer: Buffer, key: string) {
  const bucket = process.env.R2_BUCKET_NAME!;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL!;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: "image/jpeg",
  });
  console.log("R2 DEBUG", {
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  accountId: process.env.R2_ACCOUNT_ID,
  bucket: process.env.R2_BUCKET_NAME,
  publicBaseUrl: process.env.R2_PUBLIC_BASE_URL,
  accessKeyPresent: !!process.env.R2_ACCESS_KEY_ID,
  secretPresent: !!process.env.R2_SECRET_ACCESS_KEY,
  accessKeyPrefix: process.env.R2_ACCESS_KEY_ID?.slice(0, 6),
});

  await s3.send(command);

  return `${publicBaseUrl}/${key}`;
}