import express from 'express'
import cors from 'cors'
import multer from 'multer'
import dotenv from 'dotenv'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

dotenv.config()

// Constants
const PORT = process.env.PORT || 3001
const ALLOWED_ORIGINS = ['http://localhost:5173', 'http://localhost:3000', 'https://upload-image.fannapp.my.id']
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

// Multer Configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.'))
    }
  }
})

// Express App Setup
const app = express()
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }))
app.use(express.json())

// Utility: Generate random filename
const generateRandomFilename = (originalName) => {
  const extension = originalName.split('.').pop()
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 15)
  return `${timestamp}_${randomStr}.${extension}`
}

// Utility: Generate S3 URL
const generateS3Url = (bucket, region, key) => {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
}

// Service: Upload to S3
const uploadToS3 = async (file, directory, newFileName) => {
  const bucketName = process.env.AWS_BUCKET_NAME
  const key = `${directory}/${newFileName}`

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  })

  const response = await s3Client.send(command)

  return {
    success: true,
    key,
    url: generateS3Url(bucketName, process.env.AWS_REGION, key),
    bucket: bucketName,
    region: process.env.AWS_REGION,
    etag: response.ETag,
  }
}

// Service: Process single file upload
const processFileUpload = async (file, directory) => {
  const originalName = file.originalname
  const newFileName = generateRandomFilename(originalName)

  try {
    const result = await uploadToS3(file, directory, newFileName)
    return { ...result, originalName, newName: newFileName }
  } catch (error) {
    console.error(`Error uploading ${originalName}:`, error)
    return {
      success: false,
      originalName,
      newName: newFileName,
      error: error.message,
    }
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend API is running',
    timestamp: new Date().toISOString()
  })
})

// Upload endpoint
app.post('/api/upload', upload.array('files'), async (req, res) => {
  try {
    const { directory } = req.body

    if (!directory) {
      return res.status(400).json({
        success: false,
        message: 'Directory name is required'
      })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      })
    }

    const uploadPromises = req.files.map(async (file) => {
      const originalName = file.originalname
      const newFileName = generateRandomFilename(originalName)

      try {
        const result = await uploadToS3(file, directory, newFileName)
        return {
          ...result,
          originalName,
          newName: newFileName,
        }
      } catch (error) {
        console.error(`Error uploading ${originalName}:`, error)
        return {
          success: false,
          originalName,
          newName: newFileName,
          error: error.message,
        }
      }
    })

    const results = await Promise.all(uploadPromises)

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    res.json({
      success: successCount > 0,
      message: `${successCount} file(s) uploaded successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
      results,
    })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message,
    })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB'
      })
    }
  }
  
  res.status(500).json({
    success: false,
    message: error.message || 'Internal server error'
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
  console.log(`📡 API endpoints:`)
  console.log(`   - GET  http://localhost:${PORT}/api/health`)
  console.log(`   - POST http://localhost:${PORT}/api/upload`)
})
