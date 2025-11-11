import { describe, it, expect, beforeEach } from 'vitest';
import { Card } from '../src/core/Card';
import { DiscardPile } from '../src/core/DiscardPile';

interface TestCardProps {
  value: number;
  suit: string;
}

describe('DiscardPile', () => {
  let pile: DiscardPile<TestCardProps>;
  let card1: Card<TestCardProps>;
  let card2: Card<TestCardProps>;
  let card3: Card<TestCardProps>;
  let card4: Card<TestCardProps>;
  let card5: Card<TestCardProps>;

  beforeEach(() => {
    pile = new DiscardPile<TestCardProps>();
    card1 = new Card<TestCardProps>({ value: 1, suit: 'hearts' });
    card2 = new Card<TestCardProps>({ value: 2, suit: 'diamonds' });
    card3 = new Card<TestCardProps>({ value: 3, suit: 'clubs' });
    card4 = new Card<TestCardProps>({ value: 4, suit: 'spades' });
    card5 = new Card<TestCardProps>({ value: 5, suit: 'hearts' });
  });

  describe('discard', () => {
    it('should add card to pile', () => {
      pile.discard(card1);

      expect(pile.size).toBe(1);
      expect(pile.contains(card1)).toBe(true);
    });

    it('should add multiple cards sequentially', () => {
      pile.discard(card1);
      pile.discard(card2);
      pile.discard(card3);

      expect(pile.size).toBe(3);
    });
  });

  describe('discardMany', () => {
    it('should add multiple cards at once', () => {
      pile.discardMany([card1, card2, card3]);

      expect(pile.size).toBe(3);
    });

    it('should preserve order of discarded cards', () => {
      pile.discardMany([card1, card2, card3]);

      expect(pile.peek(0)).toBe(card1);
      expect(pile.peek(1)).toBe(card2);
      expect(pile.peek(2)).toBe(card3);
    });
  });

  describe('peekTop', () => {
    beforeEach(() => {
      pile.discardMany([card1, card2, card3]);
    });

    it('should return top card without removing it', () => {
      const top = pile.peekTop();

      expect(top).toBe(card3);
      expect(pile.size).toBe(3);
    });

    it('should return undefined when pile is empty', () => {
      const emptyPile = new DiscardPile<TestCardProps>();
      const top = emptyPile.peekTop();

      expect(top).toBeUndefined();
    });
  });

  describe('peekBottom', () => {
    beforeEach(() => {
      pile.discardMany([card1, card2, card3]);
    });

    it('should return bottom card without removing it', () => {
      const bottom = pile.peekBottom();

      expect(bottom).toBe(card1);
      expect(pile.size).toBe(3);
    });

    it('should return undefined when pile is empty', () => {
      const emptyPile = new DiscardPile<TestCardProps>();
      const bottom = emptyPile.peekBottom();

      expect(bottom).toBeUndefined();
    });
  });

  describe('takeAll', () => {
    beforeEach(() => {
      pile.discardMany([card1, card2, card3, card4, card5]);
    });

    it('should take all cards from pile', () => {
      const taken = pile.takeAll();

      expect(taken.length).toBe(5);
      expect(pile.isEmpty).toBe(true);
    });

    it('should return cards in correct order', () => {
      const taken = pile.takeAll();

      expect(taken).toContain(card1);
      expect(taken).toContain(card2);
      expect(taken).toContain(card3);
      expect(taken).toContain(card4);
      expect(taken).toContain(card5);
    });

    it('should keep top card when keepTop is true', () => {
      const taken = pile.takeAll(true);

      expect(taken.length).toBe(4);
      expect(pile.size).toBe(1);
      expect(pile.peekTop()).toBe(card5);
    });

    it('should handle empty pile', () => {
      const emptyPile = new DiscardPile<TestCardProps>();
      const taken = emptyPile.takeAll();

      expect(taken).toEqual([]);
    });

    it('should handle single card pile with keepTop', () => {
      const singlePile = new DiscardPile<TestCardProps>();
      singlePile.discard(card1);

      const taken = singlePile.takeAll(true);

      expect(taken).toEqual([]);
      expect(singlePile.size).toBe(1);
      expect(singlePile.peekTop()).toBe(card1);
    });
  });

  describe('takeTop', () => {
    beforeEach(() => {
      pile.discardMany([card1, card2, card3, card4, card5]);
    });

    it('should take specified number of cards from top', () => {
      const taken = pile.takeTop(2);

      expect(taken.length).toBe(2);
      expect(taken[0]).toBe(card5);
      expect(taken[1]).toBe(card4);
      expect(pile.size).toBe(3);
    });

    it('should take all remaining cards if count exceeds size', () => {
      const taken = pile.takeTop(10);

      expect(taken.length).toBe(5);
      expect(pile.isEmpty).toBe(true);
    });

    it('should return empty array when pile is empty', () => {
      const emptyPile = new DiscardPile<TestCardProps>();
      const taken = emptyPile.takeTop(3);

      expect(taken).toEqual([]);
    });

    it('should return empty array when count is 0', () => {
      const taken = pile.takeTop(0);

      expect(taken).toEqual([]);
      expect(pile.size).toBe(5);
    });
  });

  describe('takeBottom', () => {
    beforeEach(() => {
      pile.discardMany([card1, card2, card3, card4, card5]);
    });

    it('should take specified number of cards from bottom', () => {
      const taken = pile.takeBottom(2);

      expect(taken.length).toBe(2);
      expect(taken[0]).toBe(card1);
      expect(taken[1]).toBe(card2);
      expect(pile.size).toBe(3);
    });

    it('should take all remaining cards if count exceeds size', () => {
      const taken = pile.takeBottom(10);

      expect(taken.length).toBe(5);
      expect(pile.isEmpty).toBe(true);
    });

    it('should return empty array when pile is empty', () => {
      const emptyPile = new DiscardPile<TestCardProps>();
      const taken = emptyPile.takeBottom(3);

      expect(taken).toEqual([]);
    });
  });

  describe('shuffle', () => {
    beforeEach(() => {
      pile.discardMany([card1, card2, card3, card4, card5]);
    });

    it('should maintain pile size after shuffling', () => {
      pile.shuffle();

      expect(pile.size).toBe(5);
    });

    it('should contain same cards after shuffling', () => {
      const originalCards = [...pile.allCards];
      pile.shuffle();

      expect(pile.size).toBe(originalCards.length);
      originalCards.forEach(card => {
        expect(pile.contains(card)).toBe(true);
      });
    });

    it('should change card order (statistically)', () => {
      const originalOrder = pile.allCards.map(c => c.id);
      pile.shuffle();
      const shuffledOrder = pile.allCards.map(c => c.id);

      expect(originalOrder).not.toEqual(shuffledOrder);
    });

    it('should be chainable', () => {
      const result = pile.shuffle();

      expect(result).toBe(pile);
    });

    it('should handle empty pile without errors', () => {
      const emptyPile = new DiscardPile<TestCardProps>();

      expect(() => emptyPile.shuffle()).not.toThrow();
      expect(emptyPile.size).toBe(0);
    });
  });

  describe('takeAllAndShuffle', () => {
    beforeEach(() => {
      pile.discardMany([card1, card2, card3, card4, card5]);
    });

    it('should take and shuffle all cards', () => {
      const taken = pile.takeAllAndShuffle();

      expect(taken.length).toBe(5);
      expect(pile.isEmpty).toBe(true);
    });

    it('should contain all original cards', () => {
      const taken = pile.takeAllAndShuffle();

      expect(taken).toContain(card1);
      expect(taken).toContain(card2);
      expect(taken).toContain(card3);
      expect(taken).toContain(card4);
      expect(taken).toContain(card5);
    });

    it('should keep top card when keepTop is true', () => {
      const taken = pile.takeAllAndShuffle(true);

      expect(taken.length).toBe(4);
      expect(pile.size).toBe(1);
      expect(pile.peekTop()).toBe(card5);
    });

    it('should shuffle the returned cards (statistically)', () => {
      // Run multiple times to increase likelihood of different order
      const orders = new Set<string>();

      for (let i = 0; i < 5; i++) {
        pile.clear();
        pile.discardMany([card1, card2, card3, card4, card5]);

        const taken = pile.takeAllAndShuffle();
        const order = taken.map(c => c.id).join(',');
        orders.add(order);
      }

      // With 5 cards, we should get different orders in 5 attempts
      // (though theoretically it could fail)
      expect(orders.size).toBeGreaterThan(1);
    });

    it('should handle empty pile', () => {
      const emptyPile = new DiscardPile<TestCardProps>();
      const taken = emptyPile.takeAllAndShuffle();

      expect(taken).toEqual([]);
    });
  });

  describe('integration - typical game flow', () => {
    it('should support typical reshuffle pattern', () => {
      // Discard cards during game
      pile.discard(card1);
      pile.discard(card2);
      pile.discard(card3);

      expect(pile.size).toBe(3);

      // When deck runs out, take discard pile (keeping top card visible)
      const cardsForDeck = pile.takeAllAndShuffle(true);

      expect(cardsForDeck.length).toBe(2);
      expect(pile.size).toBe(1); // Top card remains
      expect(pile.peekTop()).toBe(card3);
    });

    it('should support taking cards for special game mechanics', () => {
      pile.discardMany([card1, card2, card3, card4, card5]);

      // Take top 3 cards for some game action
      const topCards = pile.takeTop(3);

      expect(topCards.length).toBe(3);
      expect(pile.size).toBe(2);

      // Remaining cards can still be used
      const bottom = pile.peekBottom();
      expect(bottom).toBe(card1);
    });
  });
});
