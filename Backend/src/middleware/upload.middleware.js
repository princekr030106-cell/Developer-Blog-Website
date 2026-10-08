const multer = require('multer');

// 1. Files ko disk par save karne ke bajaye RAM (buffer) me store karein
const storage = multer.memoryStorage();

// 2. MIME type validation filter
const fileFilter = (req, file, cb) => {
  // Allowed image MIME types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Custom error agar user image ke alawa koi aur file upload kare (jaise PDF, EXE, etc.)
    const error = new multer.MulterError(
      'LIMIT_UNEXPECTED_FILE',
      file.fieldname
    );
    error.message = 'Invalid file type! Only JPEG, JPG, PNG, and WEBP image formats are supported.';
    cb(error, false);
  }
};

// 3. Base Multer instance with constraints
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
    files: 1,                  // request only one file at a time
  },
});

/**
 * Wrapper middleware to intercept and format Multer errors cleanly
 * before they bubble up to the global error handler.
 * @param {string} fieldName - Form field name (e.g. 'featuredImage', 'avatar')
 */
const handleUpload = (fieldName) => {
  return (req, res, next) => {
    const uploadSingle = upload.single(fieldName);

    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer predefined errors (File size, wrong field name, etc.)
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large! Maximum allowed file size is 5MB.',
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      } else if (err) {
        // Any unknown generic errors during upload
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error.',
        });
      }

      // if everything is right then transfer the request to controller 
      next();
    });
  };
};

module.exports = handleUpload;