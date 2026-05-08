import { processFileUpload } from '../services/s3UploadService.js'

export const healthCheck = (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend API is running',
    timestamp: new Date().toISOString(),
  })
}

export const uploadFiles = async (req, res) => {
  try {
    const { directory } = req.body

    if (!directory) {
      return res.status(400).json({
        success: false,
        message: 'Directory name is required',
      })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      })
    }

    const results = await Promise.all(req.files.map((file) => processFileUpload(file, directory)))

    const successCount = results.filter((result) => result.success).length
    const failCount = results.length - successCount

    return res.json({
      success: successCount > 0,
      message: `${successCount} file(s) uploaded successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
      results,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message,
    })
  }
}
