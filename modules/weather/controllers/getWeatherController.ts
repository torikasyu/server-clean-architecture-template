import { Effect, pipe } from "effect";
import { IGetWeatherUsecase, GetWeatherRequest } from "../domain/usecases/IGetWeatherUseCase";
import express from "express";

export const getWeatherController = (getWeatherUsecase: IGetWeatherUsecase) => 
    (req: express.Request, res: express.Response) => {
        const location = req.params.location;

        if (!location || location.trim() === '') {
            res.status(400).json({ error: "Location cannot be empty" });
            return;
        }

        const getWeatherRequest: GetWeatherRequest = {location}

        pipe(
            getWeatherUsecase(getWeatherRequest),
            Effect.match({
                onFailure: (_error) => res.status(500).json({ error: "Failed to get weather" }),
                onSuccess: (weather) => res.status(200).json(weather)
            }),
            Effect.runPromise
        );
    };