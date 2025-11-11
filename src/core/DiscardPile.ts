import { Card } from './Card';
import { CardCollection } from './CardCollection';

/**
 * Represents a discard pile where played cards accumulate.
 * Provides functionality to recycle discarded cards back into a deck.
 *
 * @template T - The type of card properties
 */
export class DiscardPile<T extends Record<string, unknown> = Record<string, unknown>> extends CardCollection<T> {
  /**
   * Discards a card to the pile
   * @param card - The card to discard
   */
  discard(card: Card<T>): void {
    this.add(card);
  }

  /**
   * Discards multiple cards to the pile
   * @param cards - The cards to discard
   */
  discardMany(cards: Card<T>[]): void {
    this.addMany(cards);
  }

  /**
   * Gets the top card from the discard pile without removing it
   * @returns The top card, or undefined if pile is empty
   */
  peekTop(): Card<T> | undefined {
    return this.peek();
  }

  /**
   * Gets the bottom card from the discard pile without removing it
   * @returns The bottom card, or undefined if pile is empty
   */
  peekBottom(): Card<T> | undefined {
    return this.peek(0);
  }

  /**
   * Takes all cards from the discard pile and returns them
   * Commonly used to reshuffle into a deck
   *
   * @param keepTop - If true, keeps the top card in the pile
   * @returns Array of cards taken from the pile
   */
  takeAll(keepTop: boolean = false): Card<T>[] {
    if (keepTop && !this.isEmpty) {
      // Remove and save the top card
      const topCard = this.removeAt();

      // Take all remaining cards
      const cards = this.clear();

      // Put the top card back
      if (topCard) {
        this.add(topCard);
      }

      return cards;
    }

    return this.clear();
  }

  /**
   * Takes a specific number of cards from the top of the discard pile
   * @param count - Number of cards to take
   * @returns Array of cards taken (may be fewer if pile doesn't have enough)
   */
  takeTop(count: number): Card<T>[] {
    const taken: Card<T>[] = [];
    for (let i = 0; i < count && !this.isEmpty; i++) {
      const card = this.removeAt();
      if (card) {
        taken.push(card);
      }
    }
    return taken;
  }

  /**
   * Takes cards from the bottom of the discard pile
   * @param count - Number of cards to take
   * @returns Array of cards taken (may be fewer if pile doesn't have enough)
   */
  takeBottom(count: number): Card<T>[] {
    const taken: Card<T>[] = [];
    for (let i = 0; i < count && !this.isEmpty; i++) {
      const card = this.removeAt(0);
      if (card) {
        taken.push(card);
      }
    }
    return taken;
  }

  /**
   * Shuffles the discard pile in place
   * Uses Fisher-Yates algorithm
   * @returns The discard pile instance for chaining
   */
  shuffle(): this {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
    return this;
  }

  /**
   * Takes all cards and shuffles them, optionally keeping the top card
   * Common pattern in many card games when the deck runs out
   *
   * @param keepTop - If true, keeps the top card visible in the pile
   * @returns Array of shuffled cards
   */
  takeAllAndShuffle(keepTop: boolean = false): Card<T>[] {
    const cards = this.takeAll(keepTop);

    // Shuffle using Fisher-Yates
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    return cards;
  }
}
