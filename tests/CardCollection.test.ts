import { describe, it, expect, beforeEach } from 'vitest';
import { Card } from '../src/core/Card';
import { CardCollection } from '../src/core/CardCollection';

// Create a concrete implementation for testing
class TestCardCollection<T extends Record<string, unknown>> extends CardCollection<T> {}

interface TestCardProps {
  value: number;
  suit: string;
}

describe('CardCollection', () => {
  let collection: TestCardCollection<TestCardProps>;
  let card1: Card<TestCardProps>;
  let card2: Card<TestCardProps>;
  let card3: Card<TestCardProps>;

  beforeEach(() => {
    collection = new TestCardCollection<TestCardProps>();
    card1 = new Card<TestCardProps>({ value: 1, suit: 'hearts' });
    card2 = new Card<TestCardProps>({ value: 2, suit: 'diamonds' });
    card3 = new Card<TestCardProps>({ value: 3, suit: 'clubs' });
  });

  describe('initialization', () => {
    it('should start empty', () => {
      expect(collection.size).toBe(0);
      expect(collection.isEmpty).toBe(true);
    });

    it('should have empty allCards array', () => {
      expect(collection.allCards).toEqual([]);
    });
  });

  describe('add', () => {
    it('should add a single card', () => {
      collection.add(card1);

      expect(collection.size).toBe(1);
      expect(collection.isEmpty).toBe(false);
    });

    it('should add multiple cards sequentially', () => {
      collection.add(card1);
      collection.add(card2);
      collection.add(card3);

      expect(collection.size).toBe(3);
    });
  });

  describe('addMany', () => {
    it('should add multiple cards at once', () => {
      collection.addMany([card1, card2, card3]);

      expect(collection.size).toBe(3);
    });

    it('should add empty array without errors', () => {
      collection.addMany([]);

      expect(collection.size).toBe(0);
    });

    it('should preserve order when adding multiple cards', () => {
      collection.addMany([card1, card2, card3]);

      expect(collection.peek(0)).toBe(card1);
      expect(collection.peek(1)).toBe(card2);
      expect(collection.peek(2)).toBe(card3);
    });
  });

  describe('removeAt', () => {
    beforeEach(() => {
      collection.addMany([card1, card2, card3]);
    });

    it('should remove and return last card by default', () => {
      const removed = collection.removeAt();

      expect(removed).toBe(card3);
      expect(collection.size).toBe(2);
    });

    it('should remove card at specific index', () => {
      const removed = collection.removeAt(1);

      expect(removed).toBe(card2);
      expect(collection.size).toBe(2);
    });

    it('should handle negative indices', () => {
      const removed = collection.removeAt(-1);

      expect(removed).toBe(card3);
      expect(collection.size).toBe(2);
    });

    it('should return undefined for invalid index', () => {
      const removed = collection.removeAt(99);

      expect(removed).toBeUndefined();
      expect(collection.size).toBe(3);
    });

    it('should return undefined when collection is empty', () => {
      collection.clear();
      const removed = collection.removeAt();

      expect(removed).toBeUndefined();
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      collection.addMany([card1, card2, card3]);
    });

    it('should remove first card matching predicate', () => {
      const removed = collection.remove(c => c.getProperty('value') === 2);

      expect(removed).toBe(card2);
      expect(collection.size).toBe(2);
    });

    it('should return undefined if no match found', () => {
      const removed = collection.remove(c => c.getProperty('value') === 99);

      expect(removed).toBeUndefined();
      expect(collection.size).toBe(3);
    });

    it('should only remove first matching card', () => {
      const duplicate = new Card<TestCardProps>({ value: 1, suit: 'hearts' });
      collection.add(duplicate);

      const removed = collection.remove(c => c.getProperty('value') === 1);

      expect(removed).toBe(card1);
      expect(collection.size).toBe(3);
    });
  });

  describe('removeCard', () => {
    beforeEach(() => {
      collection.addMany([card1, card2, card3]);
    });

    it('should remove specific card instance', () => {
      const result = collection.removeCard(card2);

      expect(result).toBe(true);
      expect(collection.size).toBe(2);
      expect(collection.contains(card2)).toBe(false);
    });

    it('should return false if card not in collection', () => {
      const otherCard = new Card<TestCardProps>({ value: 99, suit: 'spades' });
      const result = collection.removeCard(otherCard);

      expect(result).toBe(false);
      expect(collection.size).toBe(3);
    });
  });

  describe('peek', () => {
    beforeEach(() => {
      collection.addMany([card1, card2, card3]);
    });

    it('should return last card without removing it', () => {
      const peeked = collection.peek();

      expect(peeked).toBe(card3);
      expect(collection.size).toBe(3);
    });

    it('should peek at specific index', () => {
      const peeked = collection.peek(0);

      expect(peeked).toBe(card1);
      expect(collection.size).toBe(3);
    });

    it('should handle negative indices', () => {
      const peeked = collection.peek(-2);

      expect(peeked).toBe(card2);
    });

    it('should return undefined for invalid index', () => {
      const peeked = collection.peek(99);

      expect(peeked).toBeUndefined();
    });
  });

  describe('find', () => {
    beforeEach(() => {
      collection.addMany([card1, card2, card3]);
    });

    it('should find first card matching predicate', () => {
      const found = collection.find(c => c.getProperty('suit') === 'diamonds');

      expect(found).toBe(card2);
    });

    it('should return undefined if no match found', () => {
      const found = collection.find(c => c.getProperty('value') === 99);

      expect(found).toBeUndefined();
    });
  });

  describe('findAll', () => {
    beforeEach(() => {
      collection.addMany([card1, card2, card3]);
      collection.add(new Card<TestCardProps>({ value: 10, suit: 'hearts' }));
    });

    it('should find all cards matching predicate', () => {
      const found = collection.findAll(c => c.getProperty('suit') === 'hearts');

      expect(found.length).toBe(2);
    });

    it('should return empty array if no matches', () => {
      const found = collection.findAll(c => c.getProperty('value') === 99);

      expect(found).toEqual([]);
    });

    it('should return all cards if predicate always true', () => {
      const found = collection.findAll(() => true);

      expect(found.length).toBe(4);
    });
  });

  describe('contains', () => {
    beforeEach(() => {
      collection.addMany([card1, card2]);
    });

    it('should return true if card is in collection', () => {
      expect(collection.contains(card1)).toBe(true);
      expect(collection.contains(card2)).toBe(true);
    });

    it('should return false if card is not in collection', () => {
      expect(collection.contains(card3)).toBe(false);
    });
  });

  describe('hasAny', () => {
    beforeEach(() => {
      collection.addMany([card1, card2, card3]);
    });

    it('should return true if any card matches', () => {
      const result = collection.hasAny(c => c.getProperty('value') === 2);

      expect(result).toBe(true);
    });

    it('should return false if no cards match', () => {
      const result = collection.hasAny(c => c.getProperty('value') === 99);

      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    beforeEach(() => {
      collection.addMany([card1, card2, card3]);
    });

    it('should remove all cards', () => {
      collection.clear();

      expect(collection.size).toBe(0);
      expect(collection.isEmpty).toBe(true);
    });

    it('should return all removed cards', () => {
      const removed = collection.clear();

      expect(removed.length).toBe(3);
      expect(removed).toContain(card1);
      expect(removed).toContain(card2);
      expect(removed).toContain(card3);
    });
  });

  describe('allCards', () => {
    it('should return a copy of the cards array', () => {
      collection.addMany([card1, card2, card3]);

      const cards = collection.allCards;
      expect(cards.length).toBe(3);

      // Verify it's a copy by adding to original
      collection.add(new Card<TestCardProps>({ value: 4, suit: 'spades' }));
      expect(cards.length).toBe(3); // Original array unchanged
      expect(collection.size).toBe(4); // Collection size changed
    });
  });

  describe('toString', () => {
    it('should include class name and size', () => {
      collection.addMany([card1, card2]);

      const str = collection.toString();
      expect(str).toContain('TestCardCollection');
      expect(str).toContain('2 cards');
    });
  });

  describe('forEach', () => {
    it('should iterate over all cards', () => {
      collection.addMany([card1, card2, card3]);

      const values: number[] = [];
      collection.forEach((card) => {
        values.push(card.getProperty('value'));
      });

      expect(values).toEqual([1, 2, 3]);
    });

    it('should provide index to callback', () => {
      collection.addMany([card1, card2, card3]);

      const indices: number[] = [];
      collection.forEach((_, index) => {
        indices.push(index);
      });

      expect(indices).toEqual([0, 1, 2]);
    });
  });

  describe('map', () => {
    it('should map cards to new values', () => {
      collection.addMany([card1, card2, card3]);

      const values = collection.map(card => card.getProperty('value'));

      expect(values).toEqual([1, 2, 3]);
    });

    it('should provide index to mapping function', () => {
      collection.addMany([card1, card2, card3]);

      const result = collection.map((card, index) => `${index}-${card.getProperty('suit')}`);

      expect(result).toEqual(['0-hearts', '1-diamonds', '2-clubs']);
    });
  });
});
