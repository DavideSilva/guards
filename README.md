# Guards Card Game Engine

A flexible TypeScript-based card game engine for building digital board games.

## Overview

This project provides a generic, extensible framework for implementing card-based board games. It focuses on core card game mechanics like deck management, shuffling, drawing, playing, and discarding cards.

## Tech Stack

- **Runtime**: Bun (fast all-in-one JavaScript runtime)
- **Language**: TypeScript (type-safe development)
- **Testing**: Vitest (fast unit test framework)
- **Linting**: ESLint with TypeScript support

## Project Structure

```
guards/
├── src/              # Source code
│   ├── core/         # Core game classes (Card, Deck, Hand, etc.)
│   └── index.ts      # Main entry point
├── tests/            # Test files
├── dist/             # Compiled output (generated)
└── coverage/         # Test coverage reports (generated)
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your system

### Installation

```bash
bun install
```

### Development

```bash
# Run tests
bun test

# Run tests in watch mode
bun test:watch

# Run tests with coverage
bun test:coverage

# Build the project
bun run build

# Lint code
bun run lint
```

## Architecture

The engine is built around these core concepts:

- **Card**: Basic unit representing a playing card
- **CardCollection**: Base class for all card containers
- **Deck**: Shuffleable collection of cards
- **Hand**: Player-specific collection with visibility rules
- **DiscardPile**: Visible collection that can reshuffle into draw pile

## Design Principles

1. **Separation of Concerns**: Game logic independent from UI
2. **Type Safety**: Leveraging TypeScript for robust code
3. **Extensibility**: Generic classes that can be customized for any card game
4. **Testability**: Unit tests for all core functionality

## Roadmap

- [x] Initial project setup
- [ ] Core card classes (Card, CardCollection)
- [ ] Deck implementation with Fisher-Yates shuffle
- [ ] Hand and DiscardPile implementations
- [ ] Game state management
- [ ] Simple example game
- [ ] UI layer (future)

## License

MIT
