import * as Minio from 'minio';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';

export interface StorageUploadResult {
  objectKey: string;
  fileUrl: string;
  storageType: 'minio' | 'local';
}

let minioClientInstance: Minio.Client | null = null;
let bucketInitialized = false;

export function getMinioConfig() {
  const endpoint = process.env.MINIO_ENDPOINT;
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;
  const portStr = process.env.MINIO_PORT;
  const useSSL = process.env.MINIO_USE_SSL === 'true';
  const bucket = process.env.MINIO_BUCKET_NAME || 'notevault-resources';

  const isConfigured = Boolean(endpoint && accessKey && secretKey);

  return {
    endpoint: endpoint || 'localhost',
    port: portStr ? parseInt(portStr, 10) : (useSSL ? 443 : 9000),
    useSSL,
    accessKey: accessKey || '',
    secretKey: secretKey || '',
    bucket,
    isConfigured,
  };
}

export function getMinioClient(): Minio.Client | null {
  const cfg = getMinioConfig();
  if (!cfg.isConfigured) {
    return null;
  }

  if (!minioClientInstance) {
    minioClientInstance = new Minio.Client({
      endPoint: cfg.endpoint,
      port: cfg.port,
      useSSL: cfg.useSSL,
      accessKey: cfg.accessKey,
      secretKey: cfg.secretKey,
    });
  }

  return minioClientInstance;
}

export async function ensureBucket(): Promise<void> {
  const client = getMinioClient();
  const { bucket } = getMinioConfig();

  if (!client || bucketInitialized) return;

  try {
    const exists = await client.bucketExists(bucket);
    if (!exists) {
      await client.makeBucket(bucket, 'us-east-1');
    }
    bucketInitialized = true;
  } catch (err: any) {
    console.warn(`[MinIO Warning] Unable to verify/create bucket "${bucket}": ${err.message}. Falling back to disk.`);
  }
}

/**
 * Uploads a document buffer to MinIO S3 object storage (with local disk fallback).
 * Never stores raw BLOBs in SQLite.
 */
export async function uploadToObjectStorage(
  objectKey: string,
  buffer: Buffer,
  mimeType: string = 'application/pdf'
): Promise<StorageUploadResult> {
  const client = getMinioClient();
  const { bucket, isConfigured } = getMinioConfig();

  // Always write to local uploads directory as instant local cache / serverless fallback
  const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const localDiskPath = path.join(uploadsDir, objectKey);
    fs.writeFileSync(localDiskPath, buffer);
  } catch {
    // Non-blocking disk write
  }

  if (isConfigured && client) {
    try {
      await ensureBucket();
      await client.putObject(bucket, objectKey, buffer, buffer.length, {
        'Content-Type': mimeType,
      });

      const fileUrl = `/api/resources/storage/${objectKey}`;
      return {
        objectKey,
        fileUrl,
        storageType: 'minio',
      };
    } catch (minioErr: any) {
      console.warn(`[MinIO Storage Warning] MinIO putObject failed: ${minioErr.message}. Stored on disk.`);
    }
  }

  return {
    objectKey,
    fileUrl: `/uploads/${objectKey}`,
    storageType: 'local',
  };
}

/**
 * Retrieves a document from MinIO or disk fallback.
 */
export async function getObjectBuffer(
  objectKey: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const client = getMinioClient();
  const { bucket, isConfigured } = getMinioConfig();

  // 1. Try MinIO if configured
  if (isConfigured && client) {
    try {
      const dataStream = await client.getObject(bucket, objectKey);
      const chunks: Buffer[] = [];
      for await (const chunk of dataStream) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const buffer = Buffer.concat(chunks);
      return {
        buffer,
        contentType: 'application/pdf',
      };
    } catch {
      // Fallback to disk
    }
  }

  // 2. Try Local Disk public/uploads
  const localDiskPath = path.resolve(process.cwd(), 'public', 'uploads', objectKey);
  if (fs.existsSync(localDiskPath)) {
    try {
      const buffer = fs.readFileSync(localDiskPath);
      return {
        buffer,
        contentType: 'application/pdf',
      };
    } catch {}
  }

  return null;
}

/**
 * Deletes an object from MinIO and local disk.
 */
export async function deleteFromObjectStorage(objectKey: string): Promise<boolean> {
  const client = getMinioClient();
  const { bucket, isConfigured } = getMinioConfig();

  // 1. Delete from MinIO
  if (isConfigured && client) {
    try {
      await client.removeObject(bucket, objectKey);
    } catch (e: any) {
      console.warn(`[MinIO Delete Warning] Failed to delete object ${objectKey}:`, e.message);
    }
  }

  // 2. Delete from local disk
  const localDiskPath = path.resolve(process.cwd(), 'public', 'uploads', objectKey);
  if (fs.existsSync(localDiskPath)) {
    try {
      fs.unlinkSync(localDiskPath);
    } catch {}
  }

  return true;
}
