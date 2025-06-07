import express from 'express'
import { setupWeatherControllers } from './modules/weather/controllers'

export const startApplication = async () => {

  const host = process.env.HOST || 'localhost'
  const port = process.env.PORT || 3000

  const app = express()

  setupWeatherControllers(app)

  const server = app.listen(port)
  console.log(`Server is running at http://${host}:${port}`)
}

startApplication().then(() => console.log('Application started successfully'))