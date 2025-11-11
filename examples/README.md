# Examples

This directory contains example applications demonstrating the card game engine.

## Interactive Demo

An interactive terminal-based demo that lets you try out the core card game functionality.

### Running the Demo

```bash
bun run demo
```

### Features

- Draw cards from a shuffled deck
- Display your hand with ASCII art
- Play or discard cards
- Sort your hand
- Reshuffle the discard pile back into the deck
- See real-time updates of the game state

### Available Commands

- `draw [n]` - Draw n cards from deck (default: 1)
- `play <i>` - Play card at index i
- `discard <i>` - Discard card at index i
- `sort` - Sort your hand by value
- `shuffle` - Shuffle the deck
- `reshuffle` - Reshuffle discard pile back into deck
- `clear` - Clear your entire hand
- `help` - Show help message
- `quit` - Exit the demo

### Example Session

```
> draw 5         # Draw 5 cards
> sort           # Sort your hand
> play 0         # Play the first card
> discard 3      # Discard the card at index 3
> reshuffle      # When deck runs out, recycle discard pile
> quit           # Exit
```

## Using in Your Own Code

```typescript
import { Deck, Hand, DiscardPile, TerminalDisplay } from 'guards-card-game';

// Create and shuffle a standard deck
const deck = Deck.createStandardDeck();
deck.shuffle();

// Create a hand with max 7 cards
const hand = new Hand(7);

// Draw cards
const cards = deck.drawMany(5);
hand.addMany(cards);

// Display the hand
TerminalDisplay.displayHand(hand, 'Player 1');

// Play a card
const playedCard = hand.play(0);

// Create discard pile
const discardPile = new DiscardPile();
if (playedCard) {
  discardPile.discard(playedCard);
}

// When deck runs out, reshuffle discard pile
if (deck.isEmpty) {
  const recycled = discardPile.takeAllAndShuffle();
  deck.addMany(recycled);
}
```
