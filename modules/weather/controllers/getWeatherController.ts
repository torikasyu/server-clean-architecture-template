import { Effect, pipe } from "effect";
import { GetWeatherUsecase } from "../domain/usecases";
import express from "express";

export const getWeatherController = (getWeatherUsecase: GetWeatherUsecase) => 
    (req: express.Request, res: express.Response) => {
        const location = req.params.location;

        if (!location || location.trim() === '') {
            res.status(400).json({ error: "Location cannot be empty" });
            return;
        }

        pipe(
            getWeatherUsecase(location),
            Effect.match({
                onFailure: (_error) => res.status(500).json({ error: "Failed to get weather" }),
                onSuccess: (weather) => res.status(200).json(weather)
            }),
            Effect.runPromise
        );
    };