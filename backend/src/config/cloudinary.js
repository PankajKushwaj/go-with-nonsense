import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

const cloudinaryConfigured =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

export const isCloudinaryConfigured = () => cloudinaryConfigured;

export const uploadBufferToCloudinary = (buffer, folder = "go-with-nonsense") => {
  if (!cloudinaryConfigured) {
    const error = new Error("Cloudinary is not configured. Add Cloudinary environment variables to upload images.");
    error.statusCode = 503;
    throw error;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }]
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

export default cloudinary;
