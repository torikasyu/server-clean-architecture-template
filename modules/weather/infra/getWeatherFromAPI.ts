import { GetWeatherFunc } from "../domain/repositories";
import { z } from "zod";
import { Effect } from "effect";
import { WeatherRepositoryError } from "../domain/entities/error";

// APIレスポンスのスキーマ定義
const WeatherAPIResponseSchema = z.object({
  current_condition: z.array(
    z.object({
      temp_C: z.string(),
      weatherDesc: z.array(z.object({
        value: z.string()
      })).optional()
    })
  ).min(1)
});

export const getWeatherFromAPI: GetWeatherFunc = (location) =>
  Effect.gen(function* () {

    if (!location || location.trim() === '') {
      yield* Effect.fail(new WeatherRepositoryError("Location cannot be empty"));
    }

    // API呼び出し
    const response = yield* Effect.tryPromise({
      try: () => fetch(`https://api.wttr.in/${encodeURIComponent(location)}?format=j1`),
      catch: (error) => new WeatherRepositoryError(`Network error: ${error}`)
    });

    if (!response.ok) {
      return yield* Effect.fail(
        new WeatherRepositoryError(`HTTP error: ${response.status}`)
      );
    }

    // JSONパース
    const data = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (error) => new WeatherRepositoryError(`JSON parse error: ${error}`)
    });

    // Zodでバリデーション
    const parseResult = WeatherAPIResponseSchema.safeParse(data);
    
    if (!parseResult.success) {
      return yield* Effect.fail(
        new WeatherRepositoryError(
          `Invalid API response format: ${parseResult.error.issues.map(issue => issue.message).join(', ')}`
        )
      );
    }

    const validatedData = parseResult.data;
    const current = validatedData.current_condition[0];
    
    const tempNumber = parseFloat(current.temp_C);
    if (isNaN(tempNumber)) {
      return yield* Effect.fail(new WeatherRepositoryError("Temperature is not a valid number"));
    }
    
    return {
      id: `${location}-${Date.now()}`,
      location: location,
      temperature: tempNumber,
      description: current.weatherDesc?.[0]?.value || 'Unknown'
    };
  });
