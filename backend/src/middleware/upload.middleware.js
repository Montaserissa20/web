const path = require('path');
const fs = require('fs');
const multer = require('multer');

const uploadDir = path.join(process.cwd(), 'uploads', 'animals');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ext || '.jpg';
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, name);
  },
});

function fileFilter(_req, file, cb) {
  // accept images only
  if (!file.mimetype?.startsWith('image/')) {
    return cb(new Error('Only image uploads are allowed'));
  }
  cb(null, true);
}

// File size limit in bytes (default: 6MB)
const MAX_FILE_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '6', 10) * 1024 * 1024;

const uploadAnimalImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = { uploadAnimalImages };
