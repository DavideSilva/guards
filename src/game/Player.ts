import { Hand } from '../core/Hand';
import { Card } from '../core/Card';
import { PlayerStatus } from './types';

/**
 * Represents a player in a card game
 *
 * @template T - The type of card properties
 */
export class Player<T extends Record<string, unknown> = Record<string, unknown>> {
  private readonly _id: string;
  private _name: string;
  private _hand: Hand<T>;
  private _status: PlayerStatus;
  private _score: number;
  private _metadata: Record<string, any>;

  /**
   * Creates a new Player
   * @param id - Unique identifier for the player
   * @param name - Display name for the player
   * @param maxHandSize - Optional maximum hand size
   */
  constructor(id: string, name: string, maxHandSize?: number) {
    this._id = id;
    this._name = name;
    this._hand = new Hand<T>(maxHandSize);
    this._status = PlayerStatus.ACTIVE;
    this._score = 0;
    this._metadata = {};
  }

  /**
   * Gets the player's unique ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * Gets the player's name
   */
  get name(): string {
    return this._name;
  }

  /**
   * Sets the player's name
   */
  set name(value: string) {
    this._name = value;
  }

  /**
   * Gets the player's hand
   */
  get hand(): Hand<T> {
    return this._hand;
  }

  /**
   * Gets the player's status
   */
  get status(): PlayerStatus {
    return this._status;
  }

  /**
   * Sets the player's status
   */
  set status(value: PlayerStatus) {
    this._status = value;
  }

  /**
   * Gets the player's score
   */
  get score(): number {
    return this._score;
  }

  /**
   * Sets the player's score
   */
  set score(value: number) {
    this._score = value;
  }

  /**
   * Checks if the player is active
   */
  get isActive(): boolean {
    return this._status === PlayerStatus.ACTIVE;
  }

  /**
   * Checks if the player's hand is empty
   */
  get hasCards(): boolean {
    return !this._hand.isEmpty;
  }

  /**
   * Gets the number of cards in the player's hand
   */
  get cardCount(): number {
    return this._hand.size;
  }

  /**
   * Adds a card to the player's hand
   * @param card - The card to add
   */
  addCard(card: Card<T>): void {
    this._hand.add(card);
  }

  /**
   * Adds multiple cards to the player's hand
   * @param cards - The cards to add
   */
  addCards(cards: Card<T>[]): void {
    this._hand.addMany(cards);
  }

  /**
   * Plays a card from the player's hand
   * @param index - The index of the card to play
   * @returns The played card, or undefined if index is invalid
   */
  playCard(index: number): Card<T> | undefined {
    return this._hand.play(index);
  }

  /**
   * Plays a card matching the predicate
   * @param predicate - Function to test each card
   * @returns The played card, or undefined if no match found
   */
  playCardWhere(predicate: (card: Card<T>) => boolean): Card<T> | undefined {
    return this._hand.playCard(predicate);
  }

  /**
   * Discards all cards from the player's hand
   * @returns Array of all discarded cards
   */
  discardHand(): Card<T>[] {
    return this._hand.discardAll();
  }

  /**
   * Sorts the player's hand
   * @param compareFn - Function to determine sort order
   */
  sortHand(compareFn: (a: Card<T>, b: Card<T>) => number): void {
    this._hand.sort(compareFn);
  }

  /**
   * Increments the player's score
   * @param points - Points to add (default: 1)
   */
  addScore(points: number = 1): void {
    this._score += points;
  }

  /**
   * Resets the player's score to zero
   */
  resetScore(): void {
    this._score = 0;
  }

  /**
   * Sets custom metadata for the player
   * @param key - Metadata key
   * @param value - Metadata value
   */
  setMetadata(key: string, value: any): void {
    this._metadata[key] = value;
  }

  /**
   * Gets custom metadata for the player
   * @param key - Metadata key
   * @returns The metadata value, or undefined if not found
   */
  getMetadata(key: string): any {
    return this._metadata[key];
  }

  /**
   * Checks if metadata key exists
   * @param key - Metadata key
   * @returns True if the key exists
   */
  hasMetadata(key: string): boolean {
    return key in this._metadata;
  }

  /**
   * Clears all metadata
   */
  clearMetadata(): void {
    this._metadata = {};
  }

  /**
   * Resets the player to initial state
   * Discards hand, resets status to ACTIVE, keeps score and metadata
   */
  reset(): void {
    this._hand.discardAll();
    this._status = PlayerStatus.ACTIVE;
  }

  /**
   * Fully resets the player including score and metadata
   */
  fullReset(): void {
    this.reset();
    this._score = 0;
    this._metadata = {};
  }

  /**
   * Creates a string representation of the player
   */
  toString(): string {
    return `Player(${this._name}, cards: ${this.cardCount}, score: ${this._score}, status: ${this._status})`;
  }

  /**
   * Converts player to JSON-serializable object
   */
  toJSON(): object {
    return {
      id: this._id,
      name: this._name,
      cardCount: this.cardCount,
      status: this._status,
      score: this._score,
      metadata: this._metadata
    };
  }
}
