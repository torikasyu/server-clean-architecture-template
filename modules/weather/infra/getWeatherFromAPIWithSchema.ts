// import { Effect, Schema } from "effect";
// import { GetWeatherFunc } from "../domain/repositories";
// import { WeatherRepositoryError } from "../domain/entities/error";

// // APIレスポンスのスキーマ定義
// const WeatherAPIResponseSchema = Schema.Struct({
//   current_condition: Schema.Array(
//     Schema.Struct({
//       temp_C: Schema.Number,
//       weatherDesc: Schema.optional(Schema.Array(
//         Schema.Struct({
//           value: Schema.String
//         })
//       ))
//     })
//   )
// });

// // スキーマを使ったバリデーション
// export const getWeatherFromAPIWithSchema: GetWeatherFunc = (location) =>
//   Effect.gen(function* () {
//     // API呼び出し
//     const response = yield* Effect.tryPromise({
//       try: () => fetch(`https://api.wttr.in/${encodeURIComponent(location)}?format=j1`),
//       catch: (error) => new WeatherRepositoryError(`Network error: ${error}`)
//     });

//     if (!response.ok) {
//       return yield* Effect.fail(
//         new WeatherRepositoryError(`HTTP error: ${response.status}`)
//       );
//     }

//     // JSONパース
//     const data = yield* Effect.tryPromise({
//       try: () => response.json() as Promise<unknown>,
//       catch: (error) => new WeatherRepositoryError(`JSON parse error: ${error}`)
//     });

//     // スキーマでバリデーション
//     const parseResult = yield* Schema.decodeUnknown(WeatherAPIResponseSchema)(data).pipe(
//       Effect.mapError((error) => new WeatherRepositoryError(`Validation error: ${error}`))
//     );

//     // バリデーション成功後は型安全にアクセス可能
//     const current = parseResult.current_condition[0];
//     const description = current.weatherDesc?.[0]?.value ?? "Unknown";

//     return {
//       id: `${location}-${Date.now()}`,
//       location: location,
//       temperature: current.temp_C,
//       description: description
//     };
//   });

// // 別の方法：部分的な型チェック
// export const safePropertyAccess = <T extends Record<string, unknown>>(
//   obj: T,
//   path: string[]
// ): unknown => {
//   let current: unknown = obj;
  
//   for (const key of path) {
//     if (typeof current !== 'object' || current === null) {
//       return undefined;
//     }
//     current = (current as Record<string, unknown>)[key];
//   }
  
//   return current;
// };

// // 使用例
// export const getWeatherFromAPIWithSafeAccess: GetWeatherFunc = (location) =>
//   Effect.gen(function* () {
//     const response = yield* Effect.tryPromise({
//       try: () => fetch(`https://api.wttr.in/${encodeURIComponent(location)}?format=j1`),
//       catch: (error) => new WeatherRepositoryError(`Network error: ${error}`)
//     });

//     if (!response.ok) {
//       return yield* Effect.fail(new WeatherRepositoryError(`HTTP error: ${response.status}`));
//     }

//     const data: unknown = yield* Effect.tryPromise({
//       try: () => response.json(),
//       catch: (error) => new WeatherRepositoryError(`JSON parse error: ${error}`)
//     });

//     // 型チェックとアクセスを同時に行う
//     if (typeof data !== 'object' || data === null) {
//       return yield* Effect.fail(new WeatherRepositoryError("Invalid response format"));
//     }

//     const dataObj = data as Record<string, unknown>;
    
//     // 安全なプロパティアクセス
//     const currentCondition = safePropertyAccess(dataObj, ['current_condition']);
    
//     if (!Array.isArray(currentCondition) || currentCondition.length === 0) {
//       return yield* Effect.fail(new WeatherRepositoryError("Invalid weather data format"));
//     }

//     const tempC = safePropertyAccess(currentCondition[0] as Record<string, unknown>, ['temp_C']);
    
//     if (typeof tempC !== 'number') {
//       return yield* Effect.fail(new WeatherRepositoryError("Temperature is not available"));
//     }

//     return {
//       id: `${location}-${Date.now()}`,
//       location: location,
//       temperature: tempC,
//       description: "Weather data"
//     };
//   });