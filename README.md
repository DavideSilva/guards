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
│   ├── ui/           # Terminal display utilities
│   └── index.ts      # Main entry point
├── examples/         # Example applications
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

### Quick Start - Try the Interactive Demo

```bash
bun run demo
```

This launches an interactive terminal demo where you can:
- Draw cards from a shuffled deck
- Display your hand with ASCII art
- Play and discard cards
- Sort your hand
- Reshuffle the discard pile

See [examples/README.md](examples/README.md) for more details.

### Development

```bash
# Run tests
bun test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage

# Build the project
bun run build

# Lint code
bun run lint

# Run interactive demo
bun run demo
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
- [x] Core card classes (Card, CardCollection)
- [x] Deck implementation with Fisher-Yates shuffle
- [x] Hand and DiscardPile implementations
- [x] Terminal UI utilities
- [x] Interactive demo
- [ ] Game state management
- [ ] Example game implementations (War, Go Fish, etc.)
- [ ] Web-based UI (future)
- [ ] Multiplayer support (future)

## License

MIT
