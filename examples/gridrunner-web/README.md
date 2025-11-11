# GridRunner Web UI

A React-based web interface for the GridRunner game - a grid-based movement card game where players navigate across customizable grids using movement cards.

## Features

- **Customizable Grid Types**: Play on either square or hexagonal grids
- **Movement Cards**: Use cards with different movement distances and special abilities
- **Interactive UI**: Click cards to select them, then click reachable cells to move
- **Visual Feedback**: See reachable positions highlighted when a card is selected
- **Score Tracking**: Track your score as you collect checkpoints and reach goals
- **Responsive Design**: Clean, modern UI that works well on different screen sizes

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown (typically `http://localhost:5173`)

## How to Play

1. **Select a Card**: Click on one of the cards in your hand
2. **See Reachable Cells**: The grid will highlight cells you can move to with that card
3. **Move**: Click on a highlighted cell to move there
4. **Reach the Goal**: Navigate to the goal cell (marked with 🏁) to win!

## Game Elements

- **Start (Green)**: Where players begin
- **Goal (Orange with 🏁)**: Reach this to win the game
- **Checkpoint (Purple with ⭐)**: Collect these for bonus points
- **Blocked (Dark Gray with 🚫)**: Cannot move through these cells
- **You (Blue with 👤)**: Your current position
- **Reachable (Green pulse)**: Cells you can move to with the selected card

## Card Types

- **Basic Movement**: Move up to a certain number of cells
- **Jump**: Can move over blocked cells
- **Teleport**: Can move to any valid cell within range
- **Multi-Turn**: Choose direction at each step

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technology Stack

- React 18
- TypeScript
- Vite
- Guards Card Game Engine
