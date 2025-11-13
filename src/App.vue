<script setup>
import { ref, computed } from 'vue'
import { uploadViaBackend } from './services/backendService.js'

// State Management
const directoryName = ref('')
const selectedFiles = ref([])
const previews = ref([])
const uploadedFiles = ref([])
const uploadStatus = ref('')
const isUploading = ref(false)
const copiedIndex = ref(null)
const uploadProgress = ref({ current: 0, total: 0 })
const errors = ref({ directory: '', files: '' })

// Constants
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MIN_DIRECTORY_LENGTH = 3
const MAX_DIRECTORY_LENGTH = 50
const INVALID_DIRECTORY_CHARS = /[<>:"/\\|?*\x00-\x1f]/g
const AUTO_RESET_DELAY = 50000

// Utility: Generate random filename
const generateRandomFilename = (originalName) => {
  const extension = originalName.split('.').pop()
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 15)
  return `${timestamp}_${randomStr}.${extension}`
}

// Validation: Directory name
const validateDirectory = () => {
  errors.value.directory = ''
  const trimmedValue = directoryName.value.trim()
  
  if (!trimmedValue) {
    errors.value.directory = 'Nama direktori wajib diisi'
    return false
  }
  
  if (INVALID_DIRECTORY_CHARS.test(trimmedValue)) {
    errors.value.directory = 'Nama direktori mengandung karakter yang tidak valid'
    return false
  }
  
  if (trimmedValue.length < MIN_DIRECTORY_LENGTH) {
    errors.value.directory = `Nama direktori minimal ${MIN_DIRECTORY_LENGTH} karakter`
    return false
  }
  
  if (trimmedValue.length > MAX_DIRECTORY_LENGTH) {
    errors.value.directory = `Nama direktori maksimal ${MAX_DIRECTORY_LENGTH} karakter`
    return false
  }
  
  return true
}

// Validation: Files
const validateFiles = () => {
  errors.value.files = ''
  
  if (selectedFiles.value.length === 0) {
    errors.value.files = 'Pilih minimal 1 file gambar'
    return false
  }
  
  for (const file of selectedFiles.value) {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      errors.value.files = `File ${file.name} bukan format gambar yang valid (JPG, PNG, GIF, WEBP)`
      return false
    }
    
    if (file.size > MAX_FILE_SIZE) {
      errors.value.files = `File ${file.name} melebihi ukuran maksimal 5MB`
      return false
    }
  }
  
  return true
}

// Utility: Reset file input
const resetFileInput = () => {
  const fileInput = document.getElementById('files')
  if (fileInput) fileInput.value = ''
}

// Utility: Generate file preview
const generatePreview = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve({
        name: file.name,
        url: e.target.result,
        size: (file.size / 1024).toFixed(2) + ' KB'
      })
    }
    reader.readAsDataURL(file)
  })
}

// Handler: File selection
const handleFileChange = async (event) => {
  const files = Array.from(event.target.files)
  selectedFiles.value = files
  
  previews.value = await Promise.all(files.map(generatePreview))
  validateFiles()
}

// Handler: Remove file
const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
  previews.value.splice(index, 1)
  resetFileInput()
  
  if (selectedFiles.value.length === 0) {
    errors.value.files = ''
  }
}

// Utility: Reset form
const resetForm = () => {
  directoryName.value = ''
  selectedFiles.value = []
  previews.value = []
  uploadStatus.value = ''
  uploadedFiles.value = []
  resetFileInput()
}

// Utility: Prepare files for upload
const prepareFilesForUpload = () => {
  return selectedFiles.value.map(file => ({
    originalName: file.name,
    newName: generateRandomFilename(file.name),
    file: file
  }))
}

// Handler: Form submit
const handleSubmit = async () => {
  if (!validateDirectory() || !validateFiles()) return
  
  isUploading.value = true
  uploadStatus.value = ''
  uploadedFiles.value = []
  uploadProgress.value = { current: 0, total: selectedFiles.value.length }
  
  try {
    const filesWithNewNames = prepareFilesForUpload()
    const results = await uploadViaBackend(
      filesWithNewNames,
      directoryName.value,
      (current, total) => { uploadProgress.value = { current, total } }
    )
    
    const successfulUploads = results.filter(r => r.success)
    const failedUploads = results.filter(r => !r.success)
    
    if (failedUploads.length > 0) {
      console.error('Failed uploads:', failedUploads)
    }
    
    uploadedFiles.value = successfulUploads.map(item => ({
      originalName: item.originalName,
      newName: item.newName,
      directory: directoryName.value,
      url: item.url,
      key: item.key
    }))
    
    uploadStatus.value = successfulUploads.length > 0 ? 'success' : 'error'
    
    setTimeout(resetForm, AUTO_RESET_DELAY)
    
  } catch (error) {
    uploadStatus.value = 'error'
    console.error('Upload error:', error)
  } finally {
    isUploading.value = false
  }
}

// Handler: Copy to clipboard
const copyToClipboard = async (text, index) => {
  try {
    await navigator.clipboard.writeText(text)
    copiedIndex.value = index
    setTimeout(() => { copiedIndex.value = null }, 2000)
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

// Computed: Form validation
const isFormValid = computed(() => 
  directoryName.value.trim() && 
  selectedFiles.value.length > 0 && 
  !errors.value.directory && 
  !errors.value.files
)
</script>

<template>
  <div class="upload-container">
    <div class="upload-card">
      <h1>📸 Upload Images</h1>
      <p class="subtitle">Upload gambar Anda ke direktori yang diinginkan</p>
      
      <form @submit.prevent="handleSubmit" class="upload-form">
        <!-- Input Direktori -->
        <div class="form-group">
          <label for="directory">
            <span class="label-icon">📁</span>
            Nama Direktori
          </label>
          <input
            id="directory"
            v-model="directoryName"
            @blur="validateDirectory"
            @input="validateDirectory"
            type="text"
            placeholder="Contoh: project-photos"
            :class="{ 'error': errors.directory }"
          />
          <span v-if="errors.directory" class="error-message">
            {{ errors.directory }}
          </span>
        </div>

        <!-- File Input -->
        <div class="form-group">
          <label for="files">
            <span class="label-icon">🖼️</span>
            Pilih Gambar
          </label>
          <div class="file-input-wrapper">
            <input
              id="files"
              type="file"
              @change="handleFileChange"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              class="file-input"
            />
            <label for="files" class="file-label">
              <span v-if="selectedFiles.length === 0">
                📤 Klik atau drag file di sini
              </span>
              <span v-else>
                ✅ {{ selectedFiles.length }} file dipilih
              </span>
            </label>
          </div>
          <span v-if="errors.files" class="error-message">
            {{ errors.files }}
          </span>
          <p class="file-info">Format: JPG, PNG, GIF, WEBP (Max 5MB per file)</p>
        </div>

        <!-- Preview Images -->
        <div v-if="previews.length > 0" class="preview-container">
          <h3>Preview Gambar</h3>
          <div class="preview-grid">
            <div v-for="(preview, index) in previews" :key="index" class="preview-item">
              <img :src="preview.url" :alt="preview.name" />
              <div class="preview-info">
                <p class="preview-name">{{ preview.name }}</p>
                <p class="preview-size">{{ preview.size }}</p>
              </div>
              <button 
                type="button" 
                @click="removeFile(index)" 
                class="remove-btn"
                title="Hapus file"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Upload Button -->
        <button 
          type="submit" 
          class="submit-btn"
          :disabled="!isFormValid || isUploading"
        >
          <span v-if="isUploading">
            ⏳ Mengupload... ({{ uploadProgress.current }}/{{ uploadProgress.total }})
          </span>
          <span v-else>🚀 Upload ke AWS S3</span>
        </button>
        
        <!-- Progress Bar -->
        <div v-if="isUploading" class="progress-bar-container">
          <div class="progress-bar" :style="{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }"></div>
        </div>

        <!-- Status Message -->
        <div v-if="uploadStatus === 'success'" class="status-message success">
          <div class="success-header">
            ✅ Upload berhasil!
          </div>
          <div class="uploaded-files-list">
            <h4>File yang berhasil diupload:</h4>
            <div v-for="(file, index) in uploadedFiles" :key="index" class="uploaded-file-item">
              <div class="info-box">
                <div class="info-icon">📄</div>
                <div class="info-content">
                  <div class="info-label">File Asli:</div>
                  <div class="info-value">{{ file.originalName }}</div>
                </div>
              </div>
              
              <div class="info-box">
                <div class="info-icon">🔄</div>
                <div class="info-content">
                  <div class="info-label">Nama Baru:</div>
                  <div class="info-value-wrapper">
                    <div class="info-value highlight">{{ file.newName }}</div>
                    <button 
                      type="button"
                      @click="copyToClipboard(file.newName, index)"
                      class="copy-btn"
                      :class="{ 'copied': copiedIndex === index }"
                      :title="copiedIndex === index ? 'Tersalin!' : 'Copy nama file'"
                    >
                      <span v-if="copiedIndex === index">✓</span>
                      <span v-else>📋</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="info-box">
                <div class="info-icon">📁</div>
                <div class="info-content">
                  <div class="info-label">Direktori:</div>
                  <div class="info-value">{{ file.directory }}</div>
                </div>
              </div>
              
              <div class="info-box">
                <div class="info-icon">🔗</div>
                <div class="info-content">
                  <div class="info-label">URL S3:</div>
                  <div class="info-value-wrapper">
                    <a :href="file.url" target="_blank" class="s3-url">{{ file.url }}</a>
                    <button 
                      type="button"
                      @click="copyToClipboard(file.url, 'url-' + index)"
                      class="copy-btn"
                      :class="{ 'copied': copiedIndex === 'url-' + index }"
                      :title="copiedIndex === 'url-' + index ? 'Tersalin!' : 'Copy URL'"
                    >
                      <span v-if="copiedIndex === 'url-' + index">✓</span>
                      <span v-else>📋</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="uploadStatus === 'error'" class="status-message error">
          ❌ Upload gagal! Silakan coba lagi.
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.upload-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.upload-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px;
  max-width: 700px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

h1 {
  color: white;
  margin: 0 0 10px 0;
  font-size: 2.5em;
  text-align: center;
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin: 0 0 30px 0;
}

.upload-form {
  background: white;
  border-radius: 15px;
  padding: 30px;
}

.form-group {
  margin-bottom: 25px;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  font-size: 1.1em;
}

.label-icon {
  margin-right: 8px;
}

input[type="text"] {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

input[type="text"]:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input[type="text"].error {
  border-color: #ff4444;
}

.error-message {
  display: block;
  color: #ff4444;
  font-size: 0.9em;
  margin-top: 5px;
  font-weight: 500;
}

.file-input-wrapper {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.file-label {
  display: block;
  padding: 30px;
  border: 3px dashed #667eea;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9ff;
  font-weight: 500;
  color: #667eea;
}

.file-label:hover {
  background: #eef0ff;
  border-color: #5568d3;
}

.file-info {
  font-size: 0.85em;
  color: #666;
  margin-top: 8px;
  text-align: center;
}

.preview-container {
  margin: 25px 0;
}

.preview-container h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.2em;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.preview-item {
  position: relative;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: #f9f9f9;
}

.preview-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.preview-info {
  padding: 8px;
}

.preview-name {
  font-size: 0.85em;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333;
  font-weight: 500;
}

.preview-size {
  font-size: 0.75em;
  margin: 4px 0 0 0;
  color: #666;
}

.remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  cursor: pointer;
  font-size: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;
}

.remove-btn:hover {
  background: #ff0000;
  transform: scale(1.1);
}

.submit-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.status-message {
  margin-top: 20px;
  padding: 20px;
  border-radius: 8px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

.status-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  text-align: center;
}

.success-header {
  text-align: center;
  font-size: 1.3em;
  margin-bottom: 20px;
  font-weight: 700;
  color: #155724;
}

.uploaded-files-list {
  margin-top: 15px;
  text-align: left;
}

.uploaded-files-list h4 {
  margin: 0 0 20px 0;
  color: #155724;
  font-size: 1.05em;
  font-weight: 600;
}

.uploaded-file-item {
  background: rgba(255, 255, 255, 0.7);
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 15px;
  border: 2px dashed #c3e6cb;
}

.info-box {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 2px dashed #b8dabd;
}

.info-box:last-child {
  margin-bottom: 0;
}

.info-icon {
  font-size: 1.5em;
  margin-right: 15px;
  flex-shrink: 0;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f8f0;
  border-radius: 6px;
}

.info-content {
  flex: 1;
  min-width: 0;
}

.info-label {
  font-weight: 700;
  color: #155724;
  margin-bottom: 5px;
  font-size: 0.95em;
}

.info-value {
  color: #2d5a2d;
  word-break: break-all;
  font-size: 0.95em;
  line-height: 1.4;
}

.info-value-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 3px;
}

.info-value.highlight {
  font-family: 'Courier New', monospace;
  background: linear-gradient(135deg, #c3e6cb 0%, #b8dabd 100%);
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 700;
  color: #155724;
  flex: 1;
  word-break: break-all;
}

.copy-btn {
  background: #155724;
  color: white;
  border: none;
  border-radius: 6px;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2em;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0;
}

.copy-btn:hover {
  background: #0f3d18;
  transform: scale(1.05);
}

.copy-btn:active {
  transform: scale(0.95);
}

.copy-btn.copied {
  background: #28a745;
  animation: pulse 0.3s ease;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 15px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
  border-radius: 10px;
}

.s3-url {
  color: #667eea;
  text-decoration: none;
  word-break: break-all;
  font-size: 0.9em;
  flex: 1;
}

.s3-url:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .upload-card {
    padding: 20px;
  }
  
  h1 {
    font-size: 2em;
  }
  
  .upload-form {
    padding: 20px;
  }
  
  .preview-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>
