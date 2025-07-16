# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript Express.js template following Clean Architecture principles. The project structure enforces separation of concerns through modular organization with distinct layers for domain logic, use cases, controllers, and infrastructure.

## Architecture

The codebase follows Clean Architecture with this structure:
```
modules/
├── factory/            # Dependency injection setup
├── routes/             # API route configuration  
└── [feature]/
    ├── applications/   # Use case implementations (interactors)
    ├── controllers/    # Presentation layer (Express route handlers)
    ├── domain/         # Core business logic
    │   ├── entities/   # Domain entities/models
    │   ├── repositories/ # Repository interfaces (function types)
    │   └── usecases/   # Use case interfaces
    └── infra/          # Infrastructure implementations
```

### Current Implementation

The `weather` module demonstrates the architecture pattern:
- **Domain Entity**: `Weather` interface with id, location, temperature, and description
- **Repository Interface**: `GetWeatherFunc` type defining the data access contract
- **Use Case Interface**: `IGetWeatherUsecase` in `domain/usecases/`
- **Use Case Implementation**: `getWeatherUsecase` in `applications/`
- **Infrastructure**: Two implementations - `getWeatherFromAPI` (external API) and `getWeatherMock` (mock data)
- **Factory**: Dependency injection setup in `modules/factory/`
- **Routes**: API routing configuration in `modules/routes/`

## Development Commands

### Available Scripts
- `npm test` - Run all Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run build` - Compile TypeScript to JavaScript
- `npm run build:watch` - Compile TypeScript in watch mode
- `npm run typecheck` - Type check without building

### Testing
- Jest is configured with TypeScript support via ts-jest
- Test files should use `.test.ts` or `.spec.ts` extensions
- Tests are located alongside source files
- Use `@jest/globals` for importing Jest functions (e.g., `import { describe, expect, it, jest } from '@jest/globals'`)
- Run a single test file: `npm test path/to/file.test.ts`
- Run tests matching a pattern: `npm test -- --testNamePattern="pattern"`

**Note**: The project still needs:
- `dev`: Development server with hot reload
- `start`: Production server
- `lint`: Code linting setup

## Implementation Guidelines

When implementing features in this clean architecture:

1. **Domain Entities** (`modules/[feature]/domain/entities/`): Pure TypeScript interfaces/classes representing business entities
2. **Repository Interfaces** (`modules/[feature]/domain/repositories/`): Function type definitions for data access (e.g., `GetWeatherFunc`)
3. **Use Case Interfaces** (`modules/[feature]/domain/usecases/`): Interface definitions for application business rules
4. **Use Case Implementations** (`modules/[feature]/applications/`): Business logic implementation, orchestrating domain objects and repositories (also called interactors)
5. **Controllers** (`modules/[feature]/controllers/`): Express route handlers, calling use cases and handling HTTP concerns
6. **Infrastructure** (`modules/[feature]/infra/`): Concrete implementations of repository functions
7. **Factory** (`modules/factory/`): Dependency injection configuration
8. **Routes** (`modules/routes/`): API routing setup, importing from factory

### Architecture Patterns

#### Repository Pattern
- Repository interfaces use function type definitions (not classes/interfaces)
- Infrastructure implementations export functions matching these types
- Multiple implementations can exist (e.g., API vs mock data sources)
- When handling external API responses, use proper type guards and explicit type conversions for safety

#### Use Case Pattern
- Use case interfaces are defined in `domain/usecases/` using function types
- Use case implementations (interactors) are in `applications/`
- Use cases orchestrate domain entities and repository functions
- Each use case focuses on a single business operation

#### Dependency Injection
- Factory pattern is used for dependency injection configuration
- Controllers receive pre-configured use cases from the factory
- Routes import and use factories to set up endpoint handlers
- This maintains proper dependency direction (outer layers depend on inner layers)

## Configuration Files

- **jest.config.js**: Jest configuration with TypeScript preset, configured to run tests in the modules directory
- **tsconfig.json**: TypeScript configuration with strict mode enabled, ES2020 target, and proper module resolution
- **.gitignore**: Standard Node.js/TypeScript ignore patterns

## Dependencies

- **express**: ^5.1.0 - Web framework
- **typescript**: ^5.8.3 (dev) - TypeScript compiler
- **jest**: ^29.7.0 (dev) - Testing framework
- **ts-jest**: ^29.3.4 (dev) - TypeScript preprocessor for Jest
- **@types/node**: ^22.15.30 (dev) - Node.js type definitions
- **@types/jest**: ^29.5.14 (dev) - Jest type definitions
- **@jest/globals**: ^30.0.0-beta.3 (dev) - Jest global imports