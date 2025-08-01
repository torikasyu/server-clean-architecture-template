# Clean Architecture with Effect Template

このドキュメントは、TypeScript + Effect + Clean Architectureを使用したプロジェクトのテンプレート構成をまとめたものです。

## プロジェクト構造

```
project-root/
├── __tests__/                 # 統合テスト
│   └── integration/
│       └── [feature]/
│           └── [controller].test.ts
├── modules/                   # 機能別モジュール
│   ├── factory/              # 依存性注入設定
│   │   └── index.ts         # DIコンテナ・ファクトリ
│   ├── routes/               # API ルーティング設定
│   │   └── index.ts         # Express ルート設定
│   └── [feature]/            # 機能名（例：weather, user, product）
│       ├── applications/     # アプリケーション層（ユースケース実装）
│       │   └── [usecase].ts
│       ├── controllers/      # プレゼンテーション層
│       │   └── [controller].ts
│       ├── domain/           # ドメイン層
│       │   ├── entities/     # エンティティ（ビジネスオブジェクト）
│       │   │   ├── [Entity].ts
│       │   │   └── error/    # ドメイン固有のエラー
│       │   │       └── index.ts
│       │   ├── repositories/ # リポジトリインターフェース
│       │   │   └── index.ts
│       │   └── usecases/     # ユースケースインターフェース
│       │       └── index.ts
│       └── infra/            # インフラストラクチャ層
│           ├── [repository implementation].ts
│           └── [repository implementation].test.ts
├── index.ts                  # アプリケーションエントリーポイント
├── CLAUDE.md                 # Claude Code向けプロジェクト指示書
├── package.json
├── tsconfig.json
├── jest.config.js
└── .gitignore
```

## 必要な依存関係

```json
{
  "dependencies": {
    "effect": "^3.16.4",
    "express": "^5.1.0"
  },
  "devDependencies": {
    "@jest/globals": "^30.0.0-beta.3",
    "@types/jest": "^29.5.14",
    "@types/node": "^22.15.30",
    "@types/supertest": "^6.0.2",
    "jest": "^29.7.0",
    "supertest": "^7.0.0",
    "ts-jest": "^29.3.4",
    "typescript": "^5.8.3"
  }
}
```

## 設定ファイル

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowJs": true,
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["modules/**/*", "types/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

### jest.config.js
```javascript
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [
    '<rootDir>/modules',
    '<rootDir>/__tests__'
  ],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'modules/**/*.ts',
    '!modules/**/*.d.ts',
    '!modules/**/*.test.ts',
    '!modules/**/*.spec.ts',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
};
```

## コード構成パターン

### 1. エンティティ (domain/entities/[Entity].ts)
```typescript
export interface Weather {
  id: string;
  location: string;
  temperature: number;
  description: string;
}
```

### 2. エラー定義 (domain/entities/error/index.ts)
```typescript
export class WeatherRepositoryError extends Error {
  readonly _tag = "RepositoryError";
  constructor(message: string) {
    super(message);
  }
}

export class WeatherValidationError extends Error {
  readonly _tag = "WeatherValidationError";
  constructor(message: string) {
    super(message);
  }
}
```

### 3. リポジトリインターフェース (domain/repositories/index.ts)
```typescript
import { Effect } from "effect";
import { Weather } from "../entities/Weather";
import { WeatherRepositoryError } from "../entities/error";

// Effect-based関数型
export type GetWeatherFunc = (location: string) => Effect.Effect<Weather, WeatherRepositoryError>;
```

### 4. インフラストラクチャ実装 (infra/[implementation].ts)

#### モック実装の例
```typescript
import { Effect } from "effect";
import { WeatherRepositoryError } from "../domain/entities/error";
import { GetWeatherFunc } from "../domain/repositories";
import { Weather } from "../domain/entities/Weather";

export const getWeatherMock: GetWeatherFunc = (location) =>
  Effect.gen(function* () {
    // バリデーション
    if (!location || location.trim() === '') {
      yield* Effect.fail(new WeatherRepositoryError("Location cannot be empty"));
    }

    // 非同期処理のシミュレーション
    yield* Effect.sleep("100 millis");

    const weather: Weather = {
      id: '1',
      location: location,
      temperature: 25,
      description: 'Sunny',
    }

    return weather;
  });
```

#### API実装の例（外部APIからのデータ取得）
```typescript
import { Effect } from "effect";
import { GetWeatherFunc } from "../domain/repositories";
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
    // バリデーション
    if (!location || location.trim() === '') {
      yield* Effect.fail(new WeatherRepositoryError("Location cannot be empty"));
    }

    // API呼び出し
    const response = yield* Effect.tryPromise({
      try: () => fetch(`https://api.example.com/weather/${encodeURIComponent(location)}`),
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

    // 型チェックとデータ変換
    if (!isObject(data)) {
      return yield* Effect.fail(new WeatherRepositoryError("Response is not an object"));
    }

    // APIレスポンスのバリデーションと変換
    // ... 型チェックとデータ抽出のロジック

    return {
      id: `${location}-${Date.now()}`,
      location: location,
      temperature: parsedTemperature,
      description: parsedDescription
    };
  });
```

### 5. ユースケースインターフェース (domain/usecases/index.ts)
```typescript
import { Effect } from "effect";
import { Weather } from "../entities/Weather";
import { WeatherRepositoryError } from "../entities/error";

// ユースケース関数型
export type GetWeatherUsecase = (location: string) => Effect.Effect<Weather, WeatherRepositoryError>;
```

### 6. ユースケース実装 (applications/[usecase].ts)
```typescript
import { GetWeatherFunc } from "../domain/repositories";
import { GetWeatherUsecase } from "../domain/usecases";

type Dependency = {
    getWeatherFunc: GetWeatherFunc
}

export const getWeatherUsecase = ({ getWeatherFunc }: Dependency): GetWeatherUsecase =>
    (location: string) => {
        return getWeatherFunc(location);
    }
```

### 7. コントローラー (controllers/[controller].ts)
```typescript
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
```

### 8. ファクトリー設定 (modules/factory/index.ts)
```typescript
import { getWeatherController } from '../weather/controllers/getWeatherController';
import { getWeatherUsecase } from '../weather/applications/getWeatherUsecase';
import { getWeatherFromAPI } from '../weather/infra/getWeatherFromAPI';

export const setupGetWeatherController = () => {
    const dependency = {
        getWeatherFunc: getWeatherFromAPI
    }
    return getWeatherController(getWeatherUsecase(dependency));
}
```

### 9. ルーティング設定 (modules/routes/index.ts) 
```typescript
import express from 'express'
import { Application } from 'express'
import { setupGetWeatherController } from '../factory';

export const setupWeatherControllers = (application: Application) => {
    const router = express.Router();

    router.get('/weather/:location', setupGetWeatherController());

    application.use('/api/', router);
}
```

### 10. メインアプリケーション (index.ts)
```typescript
import express from 'express'
import { setupWeatherControllers } from './modules/routes'

export const startApplication = async () => {

  const port = process.env.PORT || 3000

  const app = await setupApplication()
  app.listen(port)

  console.log(`Server is running at http://localhost:${port}`)
}

export const setupApplication = async (): Promise<express.Application> => {

  const app = express()

  // Middleware setup
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // CORS設定
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
  })

  // Router setup
  setupWeatherControllers(app)

  return app
}


// Only start the server if this file is run directly
if (require.main === module) {
  startApplication().then(() => console.log('Application started successfully'))
}
```

### 11. インフラストラクチャテスト (infra/[implementation].test.ts)
```typescript
import { describe, expect, it } from '@jest/globals';
import { Effect, Either } from 'effect';
import { getWeatherMock } from './getWeatherMock';
import { WeatherRepositoryError } from '../domain/entities/error';

describe('getWeatherMock', () => {
  it('正常にデータを取得できる', async () => {
    const result = await Effect.runPromise(
      Effect.either(getWeatherMock('Tokyo'))
    );

    if (Either.isLeft(result)) {
      throw result.left;
    }

    expect(result.right).toEqual({
      id: '1',
      location: 'Tokyo',
      temperature: 25,
      description: 'Sunny',
    });
  });

  it('空の場所でエラーを返す', async () => {
    const result = await Effect.runPromise(
      Effect.either(getWeatherMock(''))
    );

    if (Either.isRight(result)) {
      throw new Error('エラーが発生しなかった');
    }

    expect(result.left).toBeInstanceOf(WeatherRepositoryError);
    expect(result.left.message).toBe('Location cannot be empty');
  });
});
```

### 12. 統合テスト (__tests__/integration/[feature]/[controller].test.ts)
```typescript
import express from 'express';
import request from 'supertest';
import { setupApplication } from '../../..';

describe('getWeatherController', () => {

    let app: express.Application;

    beforeAll(async () => {
        app = await setupApplication();
    });

    it('GET /api/weather - 正常な天気データ取得', async () => {
        const response = await request(app)
            .get('/api/weather/Tokyo')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body).toBeDefined();
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('location', 'Tokyo');
        expect(response.body).toHaveProperty('temperature');
        expect(response.body).toHaveProperty('description');
    });

    it('GET /api/weather - 存在しない場所名でエラー', async () => {
        const response = await request(app)
            .get('/api/weather/HogeHoge')
            .expect(500)
            .expect('Content-Type', /json/);
        expect(response.body).toEqual({ error: "Failed to get weather" });
    });
});
```

## NPMスクリプト

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "build": "tsc",
    "build:watch": "tsc --watch",
    "typecheck": "tsc --noEmit"
  }
}
```

## 新しい機能モジュールの追加手順

1. `modules/`ディレクトリに新しいフォルダを作成
2. ドメイン層から実装開始：
   - エンティティ定義 (`domain/entities/`)
   - エラー型定義 (`domain/entities/error/`)
   - リポジトリインターフェース定義 (`domain/repositories/`)
   - ユースケースインターフェース定義 (`domain/usecases/`)
3. インフラストラクチャ層の実装：
   - リポジトリの具体的な実装 (`infra/`)
   - 単体テストの作成 (`infra/`)
4. アプリケーション層の実装：
   - ユースケース実装 (`applications/`)
5. プレゼンテーション層の実装：
   - コントローラー実装 (`controllers/`)
6. 依存性注入とルーティングの設定：
   - ファクトリー関数を `modules/factory/index.ts` に追加
   - ルート設定を `modules/routes/index.ts` に追加
7. 統合テストの作成：
   - `__tests__/integration/[feature]/`にテストファイル作成
8. メインアプリケーションへの組み込み：
   - `index.ts`でルートセットアップ関数を呼び出し（必要に応じて）

### Clean Architecture 設計原則の確認

- **依存関係の方向**: 内側の層（domain）は外側の層（infra, controllers）に依存しない
- **Interface Segregation**: 大きなインターフェースではなく、機能ごとの関数型を使用
- **Dependency Inversion**: 抽象（インターフェース）に依存し、具象（実装）に依存しない
- **Single Responsibility**: 各層、各モジュールが単一の責務を持つ

## Effectを使う利点

1. **型安全なエラーハンドリング**: エラーが型として表現される
2. **関数合成**: パイプラインで処理を組み合わせられる
3. **非同期処理の統一**: Promise、コールバック、同期処理を統一的に扱える
4. **テスタビリティ**: 副作用を分離してテストしやすい

## ベストプラクティス

1. **unknown型の使用**: 外部APIからのデータは必ず`unknown`型で受け取る
2. **型ガード関数**: 実行時の型チェックには型ガード関数を使用
3. **エラーの分類**: ドメイン固有のエラーを定義して使い分ける
4. **Effect.gen**: 複雑な処理は`Effect.gen`で読みやすく記述
5. **テスト**: `Effect.either`を使ってエラーケースもテスト

## コーディングAI向けガイドライン

### CLAUDE.md ファイルの重要性
- `CLAUDE.md` ファイルはClaude Code向けの詳細な指示書です
- プロジェクトの構造、パターン、実装方針を明確に記述
- AIがプロジェクトの設計思想を理解し、一貫性のあるコードを生成できます

### AIアシスタント使用時のベストプラクティス

#### 1. 構造の説明
```markdown
# このプロジェクトはClean Architectureに従っています
- domain層: ビジネスロジックの中核
- applications層: ユースケース実装（インタラクター）
- controllers層: HTTP リクエスト/レスポンス処理
- infra層: 外部システムとの接続
```

#### 2. 実装指示の例
```markdown
# 新機能実装時の指示例
「userモジュールを追加してください。
- エンティティ: User（id, name, email）
- ユースケース: createUser, getUserById
- リポジトリ: APIとモック実装
- weatherモジュールと同じパターンで実装」
```

#### 3. 依存関係の説明
```markdown
# 依存関係の方向性
- applications → domain repositories/usecases/entities
- controllers → applications  
- infra → domain repositories
- factory → applications + infra
- routes → factory
```

#### 4. テスト方針の明示
```markdown
# テスト戦略
- Unit tests: infra層の実装をテスト
- Integration tests: コントローラー経由のE2Eテスト
- Effect.either() を使ったエラーケースのテスト
```

### AI向け実装パターン指示

#### 関数型リポジトリパターン
```typescript
// 推奨: 関数型定義
export type GetUserFunc = (id: string) => Effect.Effect<User, UserRepositoryError>;

// 非推奨: 大きなインターフェース
interface IUserRepository {
  getUser: GetUserFunc;
  createUser: CreateUserFunc;
  // 肥大化しがち
}
```

#### エラーハンドリングパターン
```typescript
// ドメイン固有エラーの定義
export class UserRepositoryError extends Error {
  readonly _tag = "UserRepositoryError";
}

// Effect での型安全なエラーハンドリング
export type CreateUserFunc = (userData: CreateUserRequest) 
  => Effect.Effect<User, UserRepositoryError | UserValidationError>;
```

#### 依存性注入パターン
```typescript
// Factory での DI 設定
export const setupCreateUserController = () => {
  const dependency = {
    createUserFunc: createUserFromAPI  // または createUserMock
  }
  return createUserController(createUserUsecase(dependency));
}
```

### コードレビュー時のチェックポイント

1. **依存関係の方向性**: 内側の層が外側の層に依存していないか
2. **責務の分離**: コントローラーにビジネスロジックが混入していないか  
3. **型安全性**: unknown型からの型変換で型ガードを使用しているか
4. **エラーハンドリング**: Effect型でエラーが表現されているか
5. **テスタビリティ**: モック実装が提供されているか

### AIツール使用時の効果的な質問例

```markdown
# 良い質問例
「weatherモジュールと同じ構造でuserモジュールを作成してください。
ただし、UserエンティティにはemailValidationが必要です。」

「現在のgetWeatherUsecaseと同じパターンで、
複数ユーザーを取得するgetUsersUsecaseを実装してください。」

# 避けるべき曖昧な質問
「ユーザー機能を作って」
「APIを追加して」
```

このテンプレートを基に、新しいプロジェクトでClean Architecture + Effectの構成を素早く立ち上げることができます。