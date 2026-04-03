import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import https from "https";

const httpsAgent = new https.Agent({
  keepAlive: true,
  minVersion: "TLSv1.2",
});

export async function uploadToR2(buffer: Buffer, key: string) {
  console.log("R2 ENV CHECK", {
    hasAccountId: !!process.env.R2_ACCOUNT_ID,
    hasAccessKeyId: !!process.env.R2_ACCESS_KEY_ID,
    hasSecretAccessKey: !!process.env.R2_SECRET_ACCESS_KEY,
    hasBucketName: !!process.env.R2_BUCKET_NAME,
    hasPublicBaseUrl: !!process.env.R2_PUBLIC_BASE_URL,
    accountIdPreview: process.env.R2_ACCOUNT_ID?.slice(0, 6) || null,
  });

  const bucket = process.env.R2_BUCKET_NAME!;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL!;
  const endpoint = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

  const s3 = new S3Client({
    region: "auto",
    endpoint,
    forcePathStyle: true,
    requestHandler: new NodeHttpHandler({
      httpsAgent,
      connectionTimeout: 30000,
      socketTimeout: 30000,
    }),
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  console.log("R2 UPLOAD START", {
    bucket,
    key,
    bytes: buffer.length,
    endpoint,
  });

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: "image/jpeg",
  });

  try {
    await s3.send(command);

    const uploadedUrl = `${publicBaseUrl}/${key}`;

    console.log("R2 UPLOAD SUCCESS", {
      key,
      uploadedUrl,
    });

    return uploadedUrl;
  } catch (err) {
    console.error("R2 UPLOAD ERROR", {
      key,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : null,
      endpoint,
    });
    throw err;
  }
}