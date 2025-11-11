# Blackjack Web Game

A beautiful, interactive Blackjack game built with React and the Guards Card Game Engine.

## Features

- 🎴 **Realistic Card Display** - Beautiful card rendering with suits and colors
- 🎲 **Full Blackjack Rules** - Hit, Stand, Double Down
- 🤖 **Smart Dealer AI** - Follows casino rules
- 📊 **Live Statistics** - Track wins, losses, and blackjacks
- 🎨 **Smooth Animations** - Card dealing and result animations
- 📱 **Responsive Design** - Works on desktop and mobile
- ♠️ **Multi-Deck Shoe** - 6-deck game with automatic reshuffling

## How to Play

1. Enter your name to start
2. You'll be dealt 2 cards, dealer gets 2 cards (one hidden)
3. Try to get as close to 21 as possible without going over
4. **Hit**: Take another card
5. **Stand**: Keep your current hand
6. **Double Down**: Double your bet, take one more card, then stand
7. Dealer reveals hidden card and plays
8. Dealer must hit on 16 or less, stands on 17 or more
9. Results are determined and scores updated
10. Play as many rounds as you like!

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

### Installation

```bash
# From the blackjack-web directory
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

Open your browser to the URL shown (usually http://localhost:5173)

### Building for Production

```bash
# Build the app
npm run build

# Preview the production build
npm run preview
```

## Game Rules

### Card Values
- Number cards (2-10): Face value
- Face cards (J, Q, K): 10 points
- Ace: 1 or 11 (whichever is better for your hand)

### Winning
- Get closer to 21 than the dealer without going over
- If you go over 21, you "bust" and lose
- **Blackjack**: Getting 21 with your first two cards (Ace + 10-value card)
- Blackjack pays 3:2 (150 points instead of 100)

### Dealer Rules
- Dealer must hit on 16 or less
- Dealer must stand on 17 or more
- Dealer stands on soft 17 (Ace counted as 11)

## Technical Details

### Built With
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Guards Card Game Engine** - Game logic

### Architecture
- Game logic is completely separated from UI
- React components render game state
- All game rules enforced by the BlackjackGame class
- Scoring and dealer AI handled by the game engine

## Screenshots

![Blackjack Game](./screenshots/game.png)

## License

MIT
