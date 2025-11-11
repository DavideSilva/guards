import { Card } from './Card';
import { CardCollection } from './CardCollection';

/**
 * Represents a player's hand of cards.
 * Can have a maximum size limit and provides methods for playing cards.
 *
 * @template T - The type of card properties
 */
export class Hand<T extends Record<string, unknown> = Record<string, unknown>> extends CardCollection<T> {
  private _maxSize?: number;

  /**
   * Creates a new Hand
   * @param maxSize - Optional maximum number of cards allowed in hand
   */
  constructor(maxSize?: number) {
    super();
    this._maxSize = maxSize;
  }

  /**
   * Gets the maximum size of this hand
   */
  get maxSize(): number | undefined {
    return this._maxSize;
  }

  /**
   * Sets the maximum size of this hand
   */
  set maxSize(value: number | undefined) {
    this._maxSize = value;
  }

  /**
   * Checks if the hand is at maximum capacity
   */
  get isFull(): boolean {
    return this._maxSize !== undefined && this.size >= this._maxSize;
  }

  /**
   * Gets the number of remaining slots in the hand
   * Returns undefined if there's no maximum size
   */
  get remainingSlots(): number | undefined {
    return this._maxSize !== undefined ? Math.max(0, this._maxSize - this.size) : undefined;
  }

  /**
   * Adds a card to the hand
   * @param card - The card to add
   * @throws Error if hand is full
   */
  override add(card: Card<T>): void {
    if (this.isFull) {
      throw new Error(`Hand is full (max size: ${this._maxSize})`);
    }
    super.add(card);
  }

  /**
   * Adds multiple cards to the hand
   * @param cards - The cards to add
   * @throws Error if adding the cards would exceed maximum size
   */
  override addMany(cards: Card<T>[]): void {
    if (this._maxSize !== undefined && this.size + cards.length > this._maxSize) {
      throw new Error(
        `Cannot add ${cards.length} cards. Hand would exceed max size (${this._maxSize}). ` +
        `Current: ${this.size}, Remaining slots: ${this.remainingSlots}`
      );
    }
    super.addMany(cards);
  }

  /**
   * Plays (removes and returns) a card at the specified index
   * @param index - The index of the card to play
   * @returns The played card, or undefined if index is invalid
   */
  play(index: number): Card<T> | undefined {
    return this.removeAt(index);
  }

  /**
   * Plays the first card that matches the predicate
   * @param predicate - Function to test each card
   * @returns The played card, or undefined if no match found
   */
  playCard(predicate: (card: Card<T>) => boolean): Card<T> | undefined {
    return this.remove(predicate);
  }

  /**
   * Sorts the hand according to a comparison function
   * @param compareFn - Function to determine sort order
   * @returns The hand instance for chaining
   */
  sort(compareFn: (a: Card<T>, b: Card<T>) => number): this {
    this.cards.sort(compareFn);
    return this;
  }

  /**
   * Discards (removes and returns) all cards from the hand
   * @returns Array of all discarded cards
   */
  discardAll(): Card<T>[] {
    return this.clear();
  }

  /**
   * Checks if the hand can accept a certain number of cards
   * @param count - Number of cards to check
   * @returns True if the hand can accept the cards, false otherwise
   */
  canAccept(count: number): boolean {
    return this._maxSize === undefined || this.size + count <= this._maxSize;
  }

  /**
   * Attempts to add a card to the hand without throwing an error
   * @param card - The card to add
   * @returns True if card was added, false if hand was full
   */
  tryAdd(card: Card<T>): boolean {
    if (this.isFull) {
      return false;
    }
    super.add(card);
    return true;
  }

  /**
   * Attempts to add multiple cards to the hand without throwing an error
   * @param cards - The cards to add
   * @returns Number of cards successfully added
   */
  tryAddMany(cards: Card<T>[]): number {
    let added = 0;
    for (const card of cards) {
      if (this.tryAdd(card)) {
        added++;
      } else {
        break; // Stop when hand becomes full
      }
    }
    return added;
  }
}
