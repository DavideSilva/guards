/**
 * Represents a playing card with flexible properties.
 * Uses generics to allow any card game to define custom properties.
 *
 * @template T - The type of properties this card holds
 *
 * @example
 * // Standard playing card
 * interface StandardCardProps {
 *   suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
 *   rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
 * }
 * const card = new Card<StandardCardProps>({ suit: 'hearts', rank: 'A' });
 *
 * @example
 * // Custom game card
 * interface CustomCardProps {
 *   name: string;
 *   power: number;
 *   ability: string;
 * }
 * const card = new Card<CustomCardProps>({ name: 'Dragon', power: 10, ability: 'Fire breath' });
 */
export class Card<T extends Record<string, unknown> = Record<string, unknown>> {
  private readonly _id: string;
  private readonly _properties: Readonly<T>;

  /**
   * Creates a new Card instance
   * @param properties - The properties that define this card
   * @param id - Optional unique identifier (auto-generated if not provided)
   */
  constructor(properties: T, id?: string) {
    this._properties = Object.freeze({ ...properties });
    this._id = id ?? this.generateId();
  }

  /**
   * Gets the unique identifier for this card
   */
  get id(): string {
    return this._id;
  }

  /**
   * Gets all properties of this card as a readonly object
   */
  get properties(): Readonly<T> {
    return this._properties;
  }

  /**
   * Gets a specific property value from the card
   * @param key - The property key to retrieve
   * @returns The value of the specified property
   */
  getProperty<K extends keyof T>(key: K): T[K] {
    return this._properties[key];
  }

  /**
   * Checks if this card has a specific property
   * @param key - The property key to check
   * @returns True if the property exists, false otherwise
   */
  hasProperty(key: string): boolean {
    return key in this._properties;
  }

  /**
   * Creates a string representation of the card
   * @returns A formatted string showing the card's properties
   */
  toString(): string {
    const props = Object.entries(this._properties)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    return `Card(${props})`;
  }

  /**
   * Checks if this card is equal to another card
   * Two cards are equal if they have the same properties (not necessarily the same ID)
   * @param other - The card to compare with
   * @returns True if cards have identical properties, false otherwise
   */
  equals(other: Card<T>): boolean {
    const thisProps = JSON.stringify(this._properties);
    const otherProps = JSON.stringify(other._properties);
    return thisProps === otherProps;
  }

  /**
   * Checks if this card is identical to another card (same ID and properties)
   * @param other - The card to compare with
   * @returns True if cards have identical IDs and properties, false otherwise
   */
  isIdentical(other: Card<T>): boolean {
    return this._id === other._id && this.equals(other);
  }

  /**
   * Creates a copy of this card with a new ID
   * @returns A new Card instance with the same properties but different ID
   */
  clone(): Card<T> {
    return new Card<T>(this._properties as T);
  }

  /**
   * Generates a unique identifier for the card
   * @private
   */
  private generateId(): string {
    return `card_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
