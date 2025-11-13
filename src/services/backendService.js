/**
 * Upload files to backend API
 * @param {Array} filesWithNewNames - Array of file objects with new names
 * @param {string} directory - Directory name
 * @param {Function} progressCallback - Progress callback function
 * @returns {Promise<Array>} - Upload results
 */
export const uploadViaBackend = async (filesWithNewNames, directory, progressCallback) => {
  try {
    const formData = new FormData()
    formData.append('directory', directory)

    // Add all files to FormData
    filesWithNewNames.forEach((item) => {
      // Rename file before upload
      const renamedFile = new File([item.file], item.newName, { type: item.file.type })
      formData.append('files', renamedFile)
    })

    // Get backend URL from environment or default
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

    const response = await fetch(`${backendUrl}/api/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    const data = await response.json()

    // Call progress callback if provided
    if (progressCallback && data.results) {
      progressCallback(data.results.length, data.results.length)
    }

    return data.results || []
  } catch (error) {
    console.error('Error uploading via backend:', error)
    throw error
  }
}
