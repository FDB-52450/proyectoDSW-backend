import multer from 'multer'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/');
    },
    filename: function (req, file, cb) {
        const fileName = Date.now() + "-" + Math.round(Math.random() * 1E9) + "." + file.mimetype.split("/")[1]
        cb(null, fileName);
  }
})

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