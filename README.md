# Upload Image to AWS S3

Modern web application untuk upload gambar ke AWS S3 bucket dengan Vue.js frontend dan Node.js Express backend.

## 🚀 Features

- ✅ Upload multiple images simultaneously
- 📁 Custom directory naming
- 🎲 Auto-generate random filenames
- ✔️ Comprehensive form validation
- 🖼️ Image preview before upload
- 📋 One-click copy for filename & URL
- ⚡ Real-time upload progress
- 🎨 Modern & responsive UI
- ☁️ Secure upload via backend API
- 🔒 AWS credentials protected on server-side

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- AWS Account dengan S3 bucket

## 🛠️ Installation

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure backend URL in `.env`:
```env
VITE_BACKEND_URL=http://localhost:3001
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure AWS credentials in `backend/.env`:
```env
PORT=3001
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_BUCKET_NAME=your-bucket-name
```

## 🔑 AWS S3 Setup

1. Create S3 bucket in AWS Console
2. Create IAM user with permissions:
   - `s3:PutObject`
   - `s3:PutObjectAcl`
3. Generate Access Key & Secret Key
4. Update bucket permissions to allow public read (optional)
5. **No CORS configuration needed** (upload via backend)

## 🚀 Running the Application

### Start Backend Server (Terminal 1)
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:3001`

### Start Frontend Dev Server (Terminal 2)
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

### Production Build
```bash
# Build frontend
npm run build

# Preview production build
npm run preview
```

## 📝 Usage

1. Enter directory name (folder in S3)
2. Select one or more images (JPG, PNG, GIF, WEBP)
3. Preview images before upload
4. Click "Upload ke AWS S3" button
5. Wait for upload completion
6. Copy generated filename or S3 URL with one click
7. View all uploaded files with their details

## 🔒 Security

- ✅ AWS credentials stored on backend only
- ✅ `.env` files excluded from git
- ✅ File type validation (images only)
- ✅ File size limit (5MB per file)
- ✅ CORS configured for localhost only
- ⚠️ Use IAM user with minimal permissions
- ⚠️ Never commit `.env` files to repository
- ⚠️ Update CORS origins for production deployment

## ✔️ Validation Rules

### Directory Name
- Required field
- Min length: 3 characters
- Max length: 50 characters
- Invalid characters: `< > : " / \ | ? *`

### Files
- Allowed formats: JPG, PNG, GIF, WEBP
- Max size: 5MB per file
- Multiple files supported

## 📦 Tech Stack

### Frontend
- Vue.js 3 (Composition API)
- Vite (Build tool)
- CSS3 (Gradients & Animations)

### Backend
- Node.js
- Express.js
- Multer (File upload)
- AWS SDK for JavaScript v3
- CORS

## 📄 License

MIT License
