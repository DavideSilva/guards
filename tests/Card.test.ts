import { describe, it, expect } from 'vitest';
import { Card } from '../src/core/Card';

// Define test card types
interface StandardCardProps {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
}

interface CustomGameCardProps {
  name: string;
  power: number;
  ability?: string;
}

describe('Card', () => {
  describe('constructor', () => {
    it('should create a card with properties', () => {
      const props: StandardCardProps = { suit: 'hearts', rank: 'A' };
      const card = new Card(props);

      expect(card.properties).toEqual(props);
    });

    it('should generate a unique ID when not provided', () => {
      const card1 = new Card({ suit: 'hearts', rank: 'A' });
      const card2 = new Card({ suit: 'hearts', rank: 'A' });

      expect(card1.id).toBeDefined();
      expect(card2.id).toBeDefined();
      expect(card1.id).not.toBe(card2.id);
    });

    it('should use provided ID when specified', () => {
      const customId = 'custom-card-id';
      const card = new Card({ suit: 'hearts', rank: 'A' }, customId);

      expect(card.id).toBe(customId);
    });

    it('should freeze properties to make them immutable', () => {
      const props = { suit: 'hearts' as const, rank: 'A' };
      const card = new Card(props);

      expect(Object.isFrozen(card.properties)).toBe(true);
    });
  });

  describe('getProperty', () => {
    it('should retrieve a specific property value', () => {
      const card = new Card<StandardCardProps>({ suit: 'diamonds', rank: 'K' });

      expect(card.getProperty('suit')).toBe('diamonds');
      expect(card.getProperty('rank')).toBe('K');
    });

    it('should work with custom card types', () => {
      const card = new Card<CustomGameCardProps>({
        name: 'Dragon',
        power: 10,
        ability: 'Fire breath'
      });

      expect(card.getProperty('name')).toBe('Dragon');
      expect(card.getProperty('power')).toBe(10);
      expect(card.getProperty('ability')).toBe('Fire breath');
    });
  });

  describe('hasProperty', () => {
    it('should return true for existing properties', () => {
      const card = new Card({ suit: 'clubs', rank: '7' });

      expect(card.hasProperty('suit')).toBe(true);
      expect(card.hasProperty('rank')).toBe(true);
    });

    it('should return false for non-existing properties', () => {
      const card = new Card({ suit: 'clubs', rank: '7' });

      expect(card.hasProperty('color')).toBe(false);
      expect(card.hasProperty('value')).toBe(false);
    });
  });

  describe('toString', () => {
    it('should create a formatted string representation', () => {
      const card = new Card<StandardCardProps>({ suit: 'spades', rank: 'Q' });
      const str = card.toString();

      expect(str).toContain('Card(');
      expect(str).toContain('suit: spades');
      expect(str).toContain('rank: Q');
    });

    it('should work with complex properties', () => {
      const card = new Card<CustomGameCardProps>({
        name: 'Wizard',
        power: 5,
        ability: 'Magic'
      });
      const str = card.toString();

      expect(str).toContain('name: Wizard');
      expect(str).toContain('power: 5');
      expect(str).toContain('ability: Magic');
    });
  });

  describe('equals', () => {
    it('should return true for cards with identical properties', () => {
      const card1 = new Card<StandardCardProps>({ suit: 'hearts', rank: 'A' });
      const card2 = new Card<StandardCardProps>({ suit: 'hearts', rank: 'A' });

      expect(card1.equals(card2)).toBe(true);
    });

    it('should return false for cards with different properties', () => {
      const card1 = new Card<StandardCardProps>({ suit: 'hearts', rank: 'A' });
      const card2 = new Card<StandardCardProps>({ suit: 'hearts', rank: 'K' });

      expect(card1.equals(card2)).toBe(false);
    });

    it('should ignore ID differences when comparing equality', () => {
      const card1 = new Card({ suit: 'hearts', rank: 'A' }, 'id1');
      const card2 = new Card({ suit: 'hearts', rank: 'A' }, 'id2');

      expect(card1.equals(card2)).toBe(true);
      expect(card1.id).not.toBe(card2.id);
    });
  });

  describe('isIdentical', () => {
    it('should return true only when ID and properties match', () => {
      const card1 = new Card({ suit: 'hearts', rank: 'A' }, 'same-id');
      const card2 = new Card({ suit: 'hearts', rank: 'A' }, 'same-id');

      expect(card1.isIdentical(card2)).toBe(true);
    });

    it('should return false when IDs differ', () => {
      const card1 = new Card({ suit: 'hearts', rank: 'A' }, 'id1');
      const card2 = new Card({ suit: 'hearts', rank: 'A' }, 'id2');

      expect(card1.isIdentical(card2)).toBe(false);
    });

    it('should return false when properties differ', () => {
      const card1 = new Card({ suit: 'hearts', rank: 'A' }, 'same-id');
      const card2 = new Card({ suit: 'hearts', rank: 'K' }, 'same-id');

      expect(card1.isIdentical(card2)).toBe(false);
    });
  });

  describe('clone', () => {
    it('should create a new card with same properties but different ID', () => {
      const original = new Card<StandardCardProps>({ suit: 'diamonds', rank: '10' });
      const cloned = original.clone();

      expect(cloned.equals(original)).toBe(true);
      expect(cloned.id).not.toBe(original.id);
      expect(cloned.isIdentical(original)).toBe(false);
    });

    it('should not affect original when clone is created', () => {
      const original = new Card<CustomGameCardProps>({
        name: 'Knight',
        power: 7
      });
      const cloned = original.clone();

      expect(original.getProperty('name')).toBe('Knight');
      expect(cloned.getProperty('name')).toBe('Knight');
      expect(original.getProperty('power')).toBe(7);
      expect(cloned.getProperty('power')).toBe(7);
    });
  });

  describe('immutability', () => {
    it('should not allow modification of properties after creation', () => {
      const card = new Card({ suit: 'hearts', rank: 'A' });
      const props = card.properties as Record<string, unknown>;

      expect(() => {
        props.suit = 'spades';
      }).toThrow();
    });
  });
});
