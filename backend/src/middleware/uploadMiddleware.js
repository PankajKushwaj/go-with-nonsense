import multer from "multer";

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter(_req, file, callback) {
    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
      return;
    }

    callback(new Error("Only JPG, PNG, WEBP, and GIF images are allowed"));
  }
});

export default upload;
