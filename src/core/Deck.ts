import { Card } from './Card';
import { CardCollection } from './CardCollection';

/**
 * Represents a deck of cards that can be shuffled and dealt from.
 * Uses the Fisher-Yates algorithm for fair shuffling.
 *
 * @template T - The type of card properties
 */
export class Deck<T extends Record<string, unknown> = Record<string, unknown>> extends CardCollection<T> {
  /**
   * Creates a new Deck
   * @param cards - Optional initial cards to add to the deck
   */
  constructor(cards?: Card<T>[]) {
    super();
    if (cards) {
      this.addMany(cards);
    }
  }

  /**
   * Shuffles the deck using the Fisher-Yates algorithm.
   * This ensures every permutation has equal probability.
   *
   * The algorithm iterates through the deck backwards, swapping each card
   * with a random card from the remaining unshuffled portion.
   *
   * @returns The deck instance for chaining
   */
  shuffle(): this {
    for (let i = this.cards.length - 1; i > 0; i--) {
      // Pick a random index from 0 to i (inclusive)
      const j = Math.floor(Math.random() * (i + 1));

      // Swap cards[i] with cards[j]
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
    return this;
  }

  /**
   * Draws (removes and returns) the top card from the deck
   * @returns The top card, or undefined if deck is empty
   */
  draw(): Card<T> | undefined {
    return this.removeAt();
  }

  /**
   * Draws multiple cards from the deck
   * @param count - Number of cards to draw
   * @returns Array of drawn cards (may be fewer than requested if deck runs out)
   */
  drawMany(count: number): Card<T>[] {
    const drawn: Card<T>[] = [];
    for (let i = 0; i < count && !this.isEmpty; i++) {
      const card = this.draw();
      if (card) {
        drawn.push(card);
      }
    }
    return drawn;
  }

  /**
   * Deals cards to multiple recipients (like players)
   * @param recipientCount - Number of recipients
   * @param cardsPerRecipient - Number of cards each recipient should get
   * @returns Array of arrays, each containing cards for one recipient
   */
  deal(recipientCount: number, cardsPerRecipient: number): Card<T>[][] {
    const hands: Card<T>[][] = Array.from({ length: recipientCount }, () => []);

    // Deal cards in round-robin fashion
    for (let round = 0; round < cardsPerRecipient; round++) {
      for (let recipient = 0; recipient < recipientCount; recipient++) {
        const card = this.draw();
        if (card) {
          hands[recipient].push(card);
        }
      }
    }

    return hands;
  }

  /**
   * Peeks at the top card without removing it
   * @returns The top card, or undefined if deck is empty
   */
  peekTop(): Card<T> | undefined {
    return this.peek();
  }

  /**
   * Peeks at the bottom card without removing it
   * @returns The bottom card, or undefined if deck is empty
   */
  peekBottom(): Card<T> | undefined {
    return this.peek(0);
  }

  /**
   * Cuts the deck at a specific position
   * Takes cards from the top and moves them to the bottom
   *
   * @param position - Number of cards to cut from the top (default: middle)
   * @returns The deck instance for chaining
   */
  cut(position?: number): this {
    const cutPos = position ?? Math.floor(this.cards.length / 2);

    if (cutPos <= 0 || cutPos >= this.cards.length) {
      return this; // Invalid cut position, no change
    }

    const topPortion = this.cards.splice(0, cutPos);
    this.cards.push(...topPortion);

    return this;
  }

  /**
   * Sorts the deck according to a comparison function
   * @param compareFn - Function to determine sort order
   * @returns The deck instance for chaining
   */
  sort(compareFn: (a: Card<T>, b: Card<T>) => number): this {
    this.cards.sort(compareFn);
    return this;
  }

  /**
   * Creates a standard deck of playing cards
   * @returns A new Deck with standard 52 playing cards
   */
  static createStandardDeck(): Deck<{ suit: string; rank: string; value: number }> {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

    const cards: Card<{ suit: string; rank: string; value: number }>[] = [];

    for (const suit of suits) {
      for (let i = 0; i < ranks.length; i++) {
        cards.push(new Card({ suit, rank: ranks[i], value: values[i] }));
      }
    }

    return new Deck(cards);
  }
}
