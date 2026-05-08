import { PutObjectCommand } from '@aws-sdk/client-s3'
import { env } from '../config/env.js'
import { s3Client } from '../config/s3Client.js'
import { generateRandomFilename, generateS3Url } from '../utils/fileHelpers.js'

export const uploadToS3 = async (file, directory, fileName) => {
  const key = `${directory}/${fileName}`

  const command = new PutObjectCommand({
    Bucket: env.AWS_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  })

  const response = await s3Client.send(command)

  return {
    success: true,
    key,
    url: generateS3Url(env.AWS_BUCKET_NAME, env.AWS_REGION, key),
    bucket: env.AWS_BUCKET_NAME,
    region: env.AWS_REGION,
    etag: response.ETag,
  }
}

export const processFileUpload = async (file, directory) => {
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
