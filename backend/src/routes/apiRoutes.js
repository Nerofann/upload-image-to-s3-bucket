import { Router } from 'express'
import { healthCheck, uploadFiles } from '../controllers/uploadController.js'
import { upload } from '../middlewares/uploadMiddleware.js'

const router = Router()

router.get('/health', healthCheck)
router.post('/upload', upload.array('files'), uploadFiles)

export default router
