import { GetWeatherFunc } from "../domain/repositories";

import { Effect } from "effect";
import { WeatherRepositoryError } from "../domain/entities/error";

// 型ガード関数
const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value);
};

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

    // JSONパース - unknown型として受け取る
    const data: unknown = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (error) => new WeatherRepositoryError(`JSON parse error: ${error}`)
    });

    // Step 1: オブジェクトかチェック
    if (!isObject(data)) {
      return yield* Effect.fail(new WeatherRepositoryError("Response is not an object"));
    }

    // Step 2: current_conditionプロパティの存在チェック
    if (!('current_condition' in data)) {
      return yield* Effect.fail(new WeatherRepositoryError("Missing current_condition"));
    }

    const currentCondition = data.current_condition;
    
    // Step 3: current_conditionが配列かチェック
    if (!isArray(currentCondition) || currentCondition.length === 0) {
      return yield* Effect.fail(new WeatherRepositoryError("Invalid weather data format"));
    }

    // Step 4: 最初の要素を取得して型チェック
    const current = currentCondition[0];
    if (!isObject(current)) {
      return yield* Effect.fail(new WeatherRepositoryError("Invalid current condition format"));
    }

    // Step 5: 必要なプロパティを安全に取得
    const tempC = current.temp_C;
    if (typeof tempC !== 'string') {
      return yield* Effect.fail(new WeatherRepositoryError("Temperature is not a string"));
    }

    const tempNumber = parseFloat(tempC);
    if (isNaN(tempNumber)) {
      return yield* Effect.fail(new WeatherRepositoryError("Temperature is not a valid number"));
    }
    
    return {
      id: `${location}-${Date.now()}`,
      location: location,
      temperature: tempNumber,
      description: typeof current.weatherDesc === 'string' ? current.weatherDesc : 'Unknown'
    };
  });
