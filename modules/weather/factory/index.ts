import { getWeatherUsecase } from "../applications/getWeatherUsecase"
import { getWeatherFromAPI } from "../infra/getWeatherFromAPI"
import { getWeatherController } from "../controllers/getWeatherController"

export const setupGetWeatherController = () => {
    const dependency = {
        getWeatherFunc: getWeatherFromAPI
    }
    return getWeatherController(getWeatherUsecase(dependency));
}
