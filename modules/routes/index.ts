import express from 'express'
import { Application } from 'express'
import { setupGetWeatherController } from '../factory';

export const setupWeatherControllers = (application: Application) => {
    const router = express.Router();

    router.get('/weather/:location', setupGetWeatherController());

    application.use('/api/', router);
}