import multer from 'multer'

const storage = multer.memoryStorage()

export const upload = multer({ storage: storage,   
    fileFilter: function (req, file, cb) {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/webp'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed!'));
    }
  }})