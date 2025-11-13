# Backend Node.js Express API

Backend API untuk handle upload images ke AWS S3.

## 📦 Installation

```bash
cd backend
npm install
```

## ⚙️ Configuration

1. Copy `.env.example` ke `.env`:
```bash
cp .env.example .env
```

2. Isi credentials AWS Anda di `.env`:
```env
PORT=3001
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_BUCKET_NAME=your-bucket-name
```

## 🚀 Running

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server akan berjalan di `http://localhost:3001`

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "message": "Backend API is running",
  "timestamp": "2025-11-13T..."
}
```

### Upload Files
```
POST /api/upload
```

Request:
- Content-Type: `multipart/form-data`
- Body:
  - `directory`: string (required)
  - `files`: array of files (required)

Response:
```json
{
  "success": true,
  "message": "2 file(s) uploaded successfully",
  "results": [
    {
      "success": true,
      "key": "folder/timestamp_random.jpg",
      "url": "https://bucket.s3.region.amazonaws.com/folder/timestamp_random.jpg",
      "bucket": "bucket-name",
      "region": "ap-southeast-1",
      "etag": "\"...\"",
      "originalName": "photo.jpg",
      "newName": "timestamp_random.jpg"
    }
  ]
}
```

## 🔒 Security

- ✅ Credentials disimpan di backend (tidak exposed ke frontend)
- ✅ File size limit: 5MB per file
- ✅ File type validation: JPG, PNG, GIF, WEBP only
- ✅ CORS enabled untuk `localhost:5173` dan `localhost:3000`

## 📝 Notes

- Gunakan Node.js v18 atau lebih tinggi
- Pastikan AWS credentials memiliki permission `s3:PutObject`
- Untuk production, tambahkan domain Anda ke CORS origins di `server.js`
