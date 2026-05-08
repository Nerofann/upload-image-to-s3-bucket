import app from './src/app.js'
import { env } from './src/config/env.js'

app.listen(env.PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${env.PORT}`)
  console.log(`📡 API endpoints:`)
  console.log(`   - GET  http://localhost:${env.PORT}/api/health`)
  console.log(`   - POST http://localhost:${env.PORT}/api/upload`)
})
