import express from 'express'
import cors from 'cors'
import apiRoutes from './routes/apiRoutes.js'
import { uploadErrorHandler } from './middlewares/uploadMiddleware.js'

const app = express()

app.use(cors({ origin: '*' }))
app.use(express.json())

app.use('/api', apiRoutes)

app.use(uploadErrorHandler)

export default app
