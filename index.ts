import express from 'express'
import { setupWeatherControllers } from './modules/routes'

export const startApplication = async () => {

  const port = process.env.PORT || 3000

  const app = await setupApplication()
  app.listen(port)

  console.log(`Server is running at http://localhost:${port}`)
}

export const setupApplication = async (): Promise<express.Application> => {

  const app = express()

  // Middleware setup
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // CORS設定
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
  })

  // Router setup
  setupWeatherControllers(app)

  return app
}


// Only start the server if this file is run directly
if (require.main === module) {
  startApplication().then(() => console.log('Application started successfully'))
}