import express from 'express'
import { Application } from 'express'
import { getWeatherUsecase } from "../applications/getWeatherUsecase"
import { getWeatherFromAPI } from "../infra/getWeatherFromAPI"
import { getWeatherController } from "./getWeatherController"


export const setupWeatherControllers = (application: Application) => {
    const router = express.Router();

    router.get('/weather/:location', setupGetWeatherController());

    application.use('/api/', router);
}

const setupGetWeatherController = () => {
    const dependency = {
        getWeatherFunc: getWeatherFromAPI
    }
    return getWeatherController(getWeatherUsecase(dependency));
}
