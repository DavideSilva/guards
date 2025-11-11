/**
 * Deck Builder for Movement Cards
 *
 * Utility functions to create decks of movement cards for the GridRunner game
 */

import { Card } from '../../core/Card';
import { Deck } from '../../core/Deck';
import {
  MovementCard,
  MovementCardSpecial,
  SquareDirection,
  HexDirection,
  GridType,
} from './types';

/**
 * Create a basic movement card
 */
export function createMovementCard(
  id: string,
  distance: number,
  name?: string,
  description?: string,
  direction?: SquareDirection | HexDirection,
  special?: MovementCardSpecial
): Card<MovementCard> {
  const cardName = name || `Move ${distance}`;
  const cardDescription =
    description || `Move up to ${distance} cell${distance > 1 ? 's' : ''}`;

  const properties: MovementCard = {
    id,
    type: 'movement',
    distance,
    name: cardName,
    description: cardDescription,
  };

  if (direction) {
    properties.direction = direction;
  }

  if (special) {
    properties.special = special;
  }

  return new Card<MovementCard>(properties);
}

/**
 * Create a standard deck of movement cards
 */
export function createStandardDeck(
  deckSize: number = 40,
  gridType: GridType = GridType.SQUARE
): Deck<MovementCard> {
  const deck = new Deck<MovementCard>();
  const cards: Card<MovementCard>[] = [];

  // Distribution of movement distances
  const distribution = [
    { distance: 1, count: Math.floor(deckSize * 0.4) }, // 40% move 1
    { distance: 2, count: Math.floor(deckSize * 0.3) }, // 30% move 2
    { distance: 3, count: Math.floor(deckSize * 0.2) }, // 20% move 3
    { distance: 4, count: Math.floor(deckSize * 0.05) }, // 5% move 4
    { distance: 5, count: Math.floor(deckSize * 0.05) }, // 5% move 5
  ];

  let cardId = 0;

  // Generate basic movement cards
  for (const { distance, count } of distribution) {
    for (let i = 0; i < count; i++) {
      cards.push(
        createMovementCard(
          `move_${distance}_${cardId++}`,
          distance,
          `Move ${distance}`,
          `Move up to ${distance} cell${distance > 1 ? 's' : ''}`
        )
      );
    }
  }

  // Add special cards to fill remaining slots
  const remainingSlots = deckSize - cards.length;

  // Jump cards (can move over blocked cells)
  const jumpCount = Math.floor(remainingSlots * 0.3);
  for (let i = 0; i < jumpCount; i++) {
    cards.push(
      createMovementCard(
        `jump_${cardId++}`,
        2,
        'Jump',
        'Move 2 cells, can jump over blocked cells',
        undefined,
        MovementCardSpecial.JUMP
      )
    );
  }

  // Teleport cards (can teleport to any valid cell within range)
  const teleportCount = Math.floor(remainingSlots * 0.2);
  for (let i = 0; i < teleportCount; i++) {
    cards.push(
      createMovementCard(
        `teleport_${cardId++}`,
        3,
        'Teleport',
        'Teleport to any valid cell within 3 cells',
        undefined,
        MovementCardSpecial.TELEPORT
      )
    );
  }

  // Multi-turn cards (can choose direction at each step)
  const multiTurnCount = remainingSlots - jumpCount - teleportCount;
  for (let i = 0; i < multiTurnCount; i++) {
    cards.push(
      createMovementCard(
        `multiturn_${cardId++}`,
        3,
        'Multi-Turn',
        'Move 3 cells, choose direction at each step',
        undefined,
        MovementCardSpecial.MULTI_TURN
      )
    );
  }

  // Add all cards to the deck
  deck.addMany(cards);

  return deck;
}

/**
 * Create a directional deck where cards have specific directions
 * Useful for more strategic gameplay
 */
export function createDirectionalDeck(
  deckSize: number = 40,
  gridType: GridType = GridType.SQUARE
): Deck<MovementCard> {
  const deck = new Deck<MovementCard>();
  const cards: Card<MovementCard>[] = [];

  let cardId = 0;

  if (gridType === GridType.SQUARE) {
    // Four main directions
    const directions = [
      SquareDirection.NORTH,
      SquareDirection.SOUTH,
      SquareDirection.EAST,
      SquareDirection.WEST,
    ];

    const cardsPerDirection = Math.floor(deckSize / directions.length);

    for (const direction of directions) {
      for (let i = 0; i < cardsPerDirection; i++) {
        const distance = (i % 3) + 1; // Alternating between 1, 2, 3
        cards.push(
          createMovementCard(
            `dir_${direction}_${cardId++}`,
            distance,
            `Move ${direction}`,
            `Move ${distance} cell${distance > 1 ? 's' : ''} ${direction}`,
            direction
          )
        );
      }
    }
  } else {
    // Six directions for hexagonal grid
    const directions = [
      HexDirection.EAST,
      HexDirection.WEST,
      HexDirection.NORTHEAST,
      HexDirection.NORTHWEST,
      HexDirection.SOUTHEAST,
      HexDirection.SOUTHWEST,
    ];

    const cardsPerDirection = Math.floor(deckSize / directions.length);

    for (const direction of directions) {
      for (let i = 0; i < cardsPerDirection; i++) {
        const distance = (i % 3) + 1;
        cards.push(
          createMovementCard(
            `dir_${direction}_${cardId++}`,
            distance,
            `Move ${direction}`,
            `Move ${distance} cell${distance > 1 ? 's' : ''} ${direction}`,
            direction
          )
        );
      }
    }
  }

  // Fill remaining slots with wildcard movement cards
  while (cards.length < deckSize) {
    cards.push(
      createMovementCard(
        `wildcard_${cardId++}`,
        2,
        'Wildcard Move',
        'Move 2 cells in any direction'
      )
    );
  }

  deck.addMany(cards);

  return deck;
}

/**
 * Create a custom deck with specific card configuration
 */
export function createCustomDeck(
  cardConfig: Array<{
    distance: number;
    count: number;
    direction?: SquareDirection | HexDirection;
    special?: MovementCardSpecial;
    name?: string;
    description?: string;
  }>
): Deck<MovementCard> {
  const deck = new Deck<MovementCard>();
  const cards: Card<MovementCard>[] = [];

  let cardId = 0;

  for (const config of cardConfig) {
    for (let i = 0; i < config.count; i++) {
      cards.push(
        createMovementCard(
          `custom_${cardId++}`,
          config.distance,
          config.name,
          config.description,
          config.direction,
          config.special
        )
      );
    }
  }

  deck.addMany(cards);

  return deck;
}
