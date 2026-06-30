import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

// Magic numbers for file type validation
const FILE_SIGNATURES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/jpg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
};

// Validate file signature (magic numbers)
const validateFileSignature = (buffer: Buffer, mimetype: string): boolean => {
  const signatures = FILE_SIGNATURES[mimetype as keyof typeof FILE_SIGNATURES];
  if (!signatures) return false;
  
  for (let i = 0; i < signatures.length; i++) {
    if (buffer[i] !== signatures[i]) return false;
  }
  return true;
};

// Sanitize filename
const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 100);
};

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
};

// Configure multer with memory storage for validation
const storage = multer.memoryStorage();

// File filter to accept only images with signature validation
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (!extname || !mimetype) {
    return cb(new Error('Only image files are allowed (jpeg, jpg, png, webp). Maximum file size is 5MB.'));
  }

  // Validate file signature if buffer is available
  if (file.buffer && !validateFileSignature(file.buffer, file.mimetype)) {
    return cb(new Error('Invalid file type. File signature does not match the extension.'));
  }

  return cb(null, true);
};

// Configure multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// Single file upload middleware for avatar
export const uploadAvatar = upload.single('avatar');
