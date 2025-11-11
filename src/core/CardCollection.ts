import { Card } from './Card';

/**
 * Abstract base class for all card collections (Deck, Hand, DiscardPile, etc.)
 * Provides common functionality for managing groups of cards.
 *
 * @template T - The type of card properties
 */
export abstract class CardCollection<T extends Record<string, unknown> = Record<string, unknown>> {
  protected cards: Card<T>[] = [];

  /**
   * Gets the number of cards in this collection
   */
  get size(): number {
    return this.cards.length;
  }

  /**
   * Checks if the collection is empty
   */
  get isEmpty(): boolean {
    return this.cards.length === 0;
  }

  /**
   * Gets all cards in the collection as a readonly array
   */
  get allCards(): readonly Card<T>[] {
    return [...this.cards];
  }

  /**
   * Adds a card to the collection
   * @param card - The card to add
   */
  add(card: Card<T>): void {
    this.cards.push(card);
  }

  /**
   * Adds multiple cards to the collection
   * @param cards - The cards to add
   */
  addMany(cards: Card<T>[]): void {
    this.cards.push(...cards);
  }

  /**
   * Removes and returns a card at the specified index
   * @param index - The index of the card to remove (default: last card)
   * @returns The removed card, or undefined if collection is empty
   */
  removeAt(index: number = this.cards.length - 1): Card<T> | undefined {
    if (this.isEmpty) {
      return undefined;
    }

    // Normalize negative indices
    const normalizedIndex = index < 0 ? this.cards.length + index : index;

    if (normalizedIndex < 0 || normalizedIndex >= this.cards.length) {
      return undefined;
    }

    return this.cards.splice(normalizedIndex, 1)[0];
  }

  /**
   * Removes and returns the first card that matches the predicate
   * @param predicate - Function to test each card
   * @returns The removed card, or undefined if no match found
   */
  remove(predicate: (card: Card<T>) => boolean): Card<T> | undefined {
    const index = this.cards.findIndex(predicate);
    if (index === -1) {
      return undefined;
    }
    return this.removeAt(index);
  }

  /**
   * Removes a specific card instance from the collection
   * @param card - The card to remove
   * @returns True if the card was removed, false otherwise
   */
  removeCard(card: Card<T>): boolean {
    const index = this.cards.findIndex(c => c.id === card.id);
    if (index === -1) {
      return false;
    }
    this.removeAt(index);
    return true;
  }

  /**
   * Gets a card at the specified index without removing it
   * @param index - The index of the card to peek at
   * @returns The card at the index, or undefined if index is invalid
   */
  peek(index: number = this.cards.length - 1): Card<T> | undefined {
    const normalizedIndex = index < 0 ? this.cards.length + index : index;

    if (normalizedIndex < 0 || normalizedIndex >= this.cards.length) {
      return undefined;
    }

    return this.cards[normalizedIndex];
  }

  /**
   * Finds the first card that matches the predicate
   * @param predicate - Function to test each card
   * @returns The found card, or undefined if no match
   */
  find(predicate: (card: Card<T>) => boolean): Card<T> | undefined {
    return this.cards.find(predicate);
  }

  /**
   * Finds all cards that match the predicate
   * @param predicate - Function to test each card
   * @returns Array of matching cards
   */
  findAll(predicate: (card: Card<T>) => boolean): Card<T>[] {
    return this.cards.filter(predicate);
  }

  /**
   * Checks if the collection contains a specific card
   * @param card - The card to check for
   * @returns True if the card is in the collection, false otherwise
   */
  contains(card: Card<T>): boolean {
    return this.cards.some(c => c.id === card.id);
  }

  /**
   * Checks if any card in the collection matches the predicate
   * @param predicate - Function to test each card
   * @returns True if any card matches, false otherwise
   */
  hasAny(predicate: (card: Card<T>) => boolean): boolean {
    return this.cards.some(predicate);
  }

  /**
   * Removes all cards from the collection
   * @returns Array of all removed cards
   */
  clear(): Card<T>[] {
    const removed = [...this.cards];
    this.cards = [];
    return removed;
  }

  /**
   * Creates a string representation of the collection
   * @returns Formatted string showing collection type and size
   */
  toString(): string {
    return `${this.constructor.name}(${this.size} cards)`;
  }

  /**
   * Applies a function to each card in the collection
   * @param fn - Function to apply to each card
   */
  forEach(fn: (card: Card<T>, index: number) => void): void {
    this.cards.forEach(fn);
  }

  /**
   * Maps each card to a new value
   * @param fn - Function to map each card
   * @returns Array of mapped values
   */
  map<U>(fn: (card: Card<T>, index: number) => U): U[] {
    return this.cards.map(fn);
  }
}
