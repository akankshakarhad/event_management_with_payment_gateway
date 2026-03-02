const multer  = require('multer');
const cloudinary = require('../config/cloudinary');

const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// Multer instance: memory storage, file-type + size limits
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: MAX_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, JPEG, and PNG files are allowed.'));
    }
  },
});

// Upload a Buffer directly to Cloudinary, returns the upload result object
const uploadToCloudinary = (buffer, folder = 'geofest-payments') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
};

module.exports = { upload, uploadToCloudinary };
