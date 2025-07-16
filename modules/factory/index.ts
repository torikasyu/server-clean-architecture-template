import { getWeatherUsecase } from "../weather/applications/getWeatherUsecase"
import { getWeatherFromAPI } from "../weather/infra/getWeatherFromAPI"
import { getWeatherController } from "../weather/controllers/getWeatherController"

export const setupGetWeatherController = () => {
    const dependency = {
        getWeatherFunc: getWeatherFromAPI
    }
    return getWeatherController(getWeatherUsecase(dependency));
}
