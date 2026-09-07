import { RESIZE_JPEG_QUALITY, RESIZE_MAX_DIMENSION } from "./constants";

/**
 * Resizes/compresses an image client-side before upload. Vercel serverless
 * functions cap request bodies at 4.5MB and phone camera photos routinely
 * exceed that, so this runs unconditionally rather than only on oversized files.
 */
export async function resizeImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, RESIZE_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context for image resize");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", RESIZE_JPEG_QUALITY)
  );
  if (!blob) {
    throw new Error("Could not compress image");
  }

  return new File([blob], "photo.jpg", { type: "image/jpeg" });
}
