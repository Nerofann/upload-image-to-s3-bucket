export const generateRandomFilename = (originalName) => {
  const extension = originalName.split('.').pop()
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 15)
  return `${timestamp}_${randomStr}.${extension}`
}

export const generateS3Url = (bucket, region, key) => {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
}
