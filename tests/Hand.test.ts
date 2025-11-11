import { describe, it, expect, beforeEach } from 'vitest';
import { Card } from '../src/core/Card';
import { Hand } from '../src/core/Hand';

interface TestCardProps {
  value: number;
  suit: string;
}

describe('Hand', () => {
  let hand: Hand<TestCardProps>;
  let card1: Card<TestCardProps>;
  let card2: Card<TestCardProps>;
  let card3: Card<TestCardProps>;

  beforeEach(() => {
    card1 = new Card<TestCardProps>({ value: 1, suit: 'hearts' });
    card2 = new Card<TestCardProps>({ value: 2, suit: 'diamonds' });
    card3 = new Card<TestCardProps>({ value: 3, suit: 'clubs' });
  });

  describe('constructor', () => {
    it('should create hand without size limit', () => {
      hand = new Hand<TestCardProps>();

      expect(hand.maxSize).toBeUndefined();
      expect(hand.isFull).toBe(false);
      expect(hand.remainingSlots).toBeUndefined();
    });

    it('should create hand with size limit', () => {
      hand = new Hand<TestCardProps>(5);

      expect(hand.maxSize).toBe(5);
      expect(hand.isEmpty).toBe(true);
      expect(hand.remainingSlots).toBe(5);
    });
  });

  describe('maxSize management', () => {
    beforeEach(() => {
      hand = new Hand<TestCardProps>();
    });

    it('should allow setting max size', () => {
      hand.maxSize = 3;

      expect(hand.maxSize).toBe(3);
    });

    it('should allow removing max size', () => {
      hand.maxSize = 5;
      hand.maxSize = undefined;

      expect(hand.maxSize).toBeUndefined();
      expect(hand.isFull).toBe(false);
    });
  });

  describe('isFull', () => {
    it('should return false when hand has no limit', () => {
      hand = new Hand<TestCardProps>();
      hand.add(card1);
      hand.add(card2);

      expect(hand.isFull).toBe(false);
    });

    it('should return false when under limit', () => {
      hand = new Hand<TestCardProps>(3);
      hand.add(card1);

      expect(hand.isFull).toBe(false);
    });

    it('should return true when at limit', () => {
      hand = new Hand<TestCardProps>(2);
      hand.add(card1);
      hand.add(card2);

      expect(hand.isFull).toBe(true);
    });
  });

  describe('remainingSlots', () => {
    it('should return undefined when no limit', () => {
      hand = new Hand<TestCardProps>();

      expect(hand.remainingSlots).toBeUndefined();
    });

    it('should return correct number of remaining slots', () => {
      hand = new Hand<TestCardProps>(5);
      hand.add(card1);
      hand.add(card2);

      expect(hand.remainingSlots).toBe(3);
    });

    it('should return 0 when full', () => {
      hand = new Hand<TestCardProps>(2);
      hand.add(card1);
      hand.add(card2);

      expect(hand.remainingSlots).toBe(0);
    });
  });

  describe('add', () => {
    it('should add card when no limit', () => {
      hand = new Hand<TestCardProps>();
      hand.add(card1);

      expect(hand.size).toBe(1);
    });

    it('should add card when under limit', () => {
      hand = new Hand<TestCardProps>(3);
      hand.add(card1);
      hand.add(card2);

      expect(hand.size).toBe(2);
    });

    it('should throw error when hand is full', () => {
      hand = new Hand<TestCardProps>(2);
      hand.add(card1);
      hand.add(card2);

      expect(() => hand.add(card3)).toThrow('Hand is full');
    });
  });

  describe('addMany', () => {
    it('should add multiple cards when space available', () => {
      hand = new Hand<TestCardProps>(5);
      hand.addMany([card1, card2, card3]);

      expect(hand.size).toBe(3);
    });

    it('should throw error when adding would exceed limit', () => {
      hand = new Hand<TestCardProps>(2);

      expect(() => hand.addMany([card1, card2, card3])).toThrow('Cannot add 3 cards');
    });

    it('should add all cards when no limit', () => {
      hand = new Hand<TestCardProps>();
      hand.addMany([card1, card2, card3]);

      expect(hand.size).toBe(3);
    });
  });

  describe('play', () => {
    beforeEach(() => {
      hand = new Hand<TestCardProps>();
      hand.addMany([card1, card2, card3]);
    });

    it('should play card at index', () => {
      const played = hand.play(1);

      expect(played).toBe(card2);
      expect(hand.size).toBe(2);
    });

    it('should return undefined for invalid index', () => {
      const played = hand.play(10);

      expect(played).toBeUndefined();
      expect(hand.size).toBe(3);
    });

    it('should play last card by default', () => {
      const played = hand.play(2);

      expect(played).toBe(card3);
      expect(hand.size).toBe(2);
    });
  });

  describe('playCard', () => {
    beforeEach(() => {
      hand = new Hand<TestCardProps>();
      hand.addMany([card1, card2, card3]);
    });

    it('should play first card matching predicate', () => {
      const played = hand.playCard(c => c.getProperty('value') === 2);

      expect(played).toBe(card2);
      expect(hand.size).toBe(2);
    });

    it('should return undefined if no match', () => {
      const played = hand.playCard(c => c.getProperty('value') === 99);

      expect(played).toBeUndefined();
      expect(hand.size).toBe(3);
    });
  });

  describe('sort', () => {
    beforeEach(() => {
      hand = new Hand<TestCardProps>();
      hand.addMany([card3, card1, card2]);
    });

    it('should sort cards', () => {
      hand.sort((a, b) => a.getProperty('value') - b.getProperty('value'));

      expect(hand.peek(0)?.getProperty('value')).toBe(1);
      expect(hand.peek(1)?.getProperty('value')).toBe(2);
      expect(hand.peek(2)?.getProperty('value')).toBe(3);
    });

    it('should be chainable', () => {
      const result = hand.sort((a, b) => a.getProperty('value') - b.getProperty('value'));

      expect(result).toBe(hand);
    });
  });

  describe('discardAll', () => {
    beforeEach(() => {
      hand = new Hand<TestCardProps>();
      hand.addMany([card1, card2, card3]);
    });

    it('should remove and return all cards', () => {
      const discarded = hand.discardAll();

      expect(discarded.length).toBe(3);
      expect(hand.isEmpty).toBe(true);
    });

    it('should allow adding cards after discarding all', () => {
      hand = new Hand<TestCardProps>(2);
      hand.add(card1);
      hand.add(card2);

      hand.discardAll();
      hand.add(card3);

      expect(hand.size).toBe(1);
    });
  });

  describe('canAccept', () => {
    it('should return true when no limit', () => {
      hand = new Hand<TestCardProps>();

      expect(hand.canAccept(100)).toBe(true);
    });

    it('should return true when space available', () => {
      hand = new Hand<TestCardProps>(5);
      hand.add(card1);

      expect(hand.canAccept(3)).toBe(true);
    });

    it('should return false when insufficient space', () => {
      hand = new Hand<TestCardProps>(3);
      hand.add(card1);

      expect(hand.canAccept(3)).toBe(false);
    });

    it('should return true when exactly enough space', () => {
      hand = new Hand<TestCardProps>(3);
      hand.add(card1);

      expect(hand.canAccept(2)).toBe(true);
    });
  });

  describe('tryAdd', () => {
    beforeEach(() => {
      hand = new Hand<TestCardProps>(2);
    });

    it('should add card and return true when space available', () => {
      const result = hand.tryAdd(card1);

      expect(result).toBe(true);
      expect(hand.size).toBe(1);
    });

    it('should not add card and return false when full', () => {
      hand.add(card1);
      hand.add(card2);

      const result = hand.tryAdd(card3);

      expect(result).toBe(false);
      expect(hand.size).toBe(2);
    });
  });

  describe('tryAddMany', () => {
    beforeEach(() => {
      hand = new Hand<TestCardProps>(2);
    });

    it('should add all cards when space available', () => {
      const added = hand.tryAddMany([card1, card2]);

      expect(added).toBe(2);
      expect(hand.size).toBe(2);
    });

    it('should add partial cards when space limited', () => {
      hand.add(card1);

      const added = hand.tryAddMany([card2, card3]);

      expect(added).toBe(1);
      expect(hand.size).toBe(2);
    });

    it('should add no cards when full', () => {
      hand.add(card1);
      hand.add(card2);

      const added = hand.tryAddMany([card3]);

      expect(added).toBe(0);
      expect(hand.size).toBe(2);
    });
  });

  describe('integration with max size changes', () => {
    it('should allow cards beyond new max when max is reduced', () => {
      hand = new Hand<TestCardProps>(5);
      hand.addMany([card1, card2, card3]);

      hand.maxSize = 2;

      // Existing cards remain, but can't add more
      expect(hand.size).toBe(3);
      expect(hand.isFull).toBe(true);
      expect(() => hand.add(card1)).toThrow();
    });

    it('should allow adding cards when max is increased', () => {
      hand = new Hand<TestCardProps>(2);
      hand.add(card1);
      hand.add(card2);

      hand.maxSize = 5;

      expect(hand.isFull).toBe(false);
      hand.add(card3);
      expect(hand.size).toBe(3);
    });
  });
});
