import multer from 'multer'
import path from 'path'
import { ALLOWED_FILE_EXTENSIONS, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../config/constants.js'

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase()
    const isMimeAllowed = ALLOWED_FILE_TYPES.includes(file.mimetype)
    const isExtensionAllowed = ALLOWED_FILE_EXTENSIONS.includes(extension)

    if (isMimeAllowed || isExtensionAllowed) {
      cb(null, true)
      return
    }

    cb(new Error('Invalid file type. Only JPG, PNG, GIF, WEBP, PDF, XLS, and XLSX are allowed.'))
  },
})

export const uploadErrorHandler = (error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size too large. Maximum size is 5MB',
    })
  }

  return res.status(500).json({
    success: false,
    message: error.message || 'Internal server error',
  })
}
