const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const isImage = file.mimetype.startsWith('image/') || file.originalname.match(/\.(jpg|jpeg|png|gif|webp|heic|heif)$/i);
  const isVideo = file.mimetype.startsWith('video/') || file.originalname.match(/\.(mp4|mov|avi|wmv|webm|mkv|3gp)$/i);
  const isAudio = file.mimetype.startsWith('audio/') || file.originalname.match(/\.(mp3|wav|ogg|m4a|aac|webm)$/i);

  if (isImage || isVideo || isAudio) {
    cb(null, true);
  } else {
    cb(new Error('Định dạng tệp không được hỗ trợ (chấp nhận hình ảnh, video và âm thanh)!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB for HD videos and photos
  fileFilter: fileFilter
});

module.exports = upload;
