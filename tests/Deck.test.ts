import { describe, it, expect, beforeEach } from 'vitest';
import { Card } from '../src/core/Card';
import { Deck } from '../src/core/Deck';

interface TestCardProps {
  value: number;
  suit: string;
}

describe('Deck', () => {
  let deck: Deck<TestCardProps>;
  let card1: Card<TestCardProps>;
  let card2: Card<TestCardProps>;
  let card3: Card<TestCardProps>;
  let card4: Card<TestCardProps>;
  let card5: Card<TestCardProps>;

  beforeEach(() => {
    card1 = new Card<TestCardProps>({ value: 1, suit: 'hearts' });
    card2 = new Card<TestCardProps>({ value: 2, suit: 'diamonds' });
    card3 = new Card<TestCardProps>({ value: 3, suit: 'clubs' });
    card4 = new Card<TestCardProps>({ value: 4, suit: 'spades' });
    card5 = new Card<TestCardProps>({ value: 5, suit: 'hearts' });
    deck = new Deck<TestCardProps>([card1, card2, card3, card4, card5]);
  });

  describe('constructor', () => {
    it('should create an empty deck when no cards provided', () => {
      const emptyDeck = new Deck<TestCardProps>();

      expect(emptyDeck.size).toBe(0);
      expect(emptyDeck.isEmpty).toBe(true);
    });

    it('should create a deck with initial cards', () => {
      expect(deck.size).toBe(5);
      expect(deck.isEmpty).toBe(false);
    });

    it('should preserve order of initial cards', () => {
      expect(deck.peek(0)).toBe(card1);
      expect(deck.peek(1)).toBe(card2);
      expect(deck.peek(4)).toBe(card5);
    });
  });

  describe('shuffle', () => {
    it('should maintain deck size after shuffling', () => {
      deck.shuffle();

      expect(deck.size).toBe(5);
    });

    it('should contain same cards after shuffling', () => {
      const originalCards = [...deck.allCards];
      deck.shuffle();

      expect(deck.size).toBe(originalCards.length);
      originalCards.forEach(card => {
        expect(deck.contains(card)).toBe(true);
      });
    });

    it('should change card order (statistically)', () => {
      // This test might rarely fail due to random chance,
      // but probability is very low with 5 cards (1/120 = 0.83%)
      const originalOrder = deck.allCards.map(c => c.id);
      deck.shuffle();
      const shuffledOrder = deck.allCards.map(c => c.id);

      expect(originalOrder).not.toEqual(shuffledOrder);
    });

    it('should be chainable', () => {
      const result = deck.shuffle();

      expect(result).toBe(deck);
    });

    it('should handle empty deck without errors', () => {
      const emptyDeck = new Deck<TestCardProps>();

      expect(() => emptyDeck.shuffle()).not.toThrow();
      expect(emptyDeck.size).toBe(0);
    });

    it('should handle single card deck', () => {
      const singleCardDeck = new Deck<TestCardProps>([card1]);
      singleCardDeck.shuffle();

      expect(singleCardDeck.size).toBe(1);
      expect(singleCardDeck.peek()).toBe(card1);
    });
  });

  describe('draw', () => {
    it('should remove and return the top card', () => {
      const drawn = deck.draw();

      expect(drawn).toBe(card5);
      expect(deck.size).toBe(4);
      expect(deck.contains(card5)).toBe(false);
    });

    it('should draw cards in LIFO order', () => {
      const first = deck.draw();
      const second = deck.draw();
      const third = deck.draw();

      expect(first).toBe(card5);
      expect(second).toBe(card4);
      expect(third).toBe(card3);
    });

    it('should return undefined when deck is empty', () => {
      const emptyDeck = new Deck<TestCardProps>();
      const drawn = emptyDeck.draw();

      expect(drawn).toBeUndefined();
    });
  });

  describe('drawMany', () => {
    it('should draw specified number of cards', () => {
      const drawn = deck.drawMany(3);

      expect(drawn.length).toBe(3);
      expect(deck.size).toBe(2);
    });

    it('should draw cards in correct order', () => {
      const drawn = deck.drawMany(3);

      expect(drawn[0]).toBe(card5);
      expect(drawn[1]).toBe(card4);
      expect(drawn[2]).toBe(card3);
    });

    it('should draw all remaining cards if count exceeds deck size', () => {
      const drawn = deck.drawMany(10);

      expect(drawn.length).toBe(5);
      expect(deck.isEmpty).toBe(true);
    });

    it('should return empty array when deck is empty', () => {
      const emptyDeck = new Deck<TestCardProps>();
      const drawn = emptyDeck.drawMany(5);

      expect(drawn).toEqual([]);
    });

    it('should return empty array when count is 0', () => {
      const drawn = deck.drawMany(0);

      expect(drawn).toEqual([]);
      expect(deck.size).toBe(5);
    });
  });

  describe('deal', () => {
    it('should deal cards to multiple recipients', () => {
      const hands = deck.deal(2, 2);

      expect(hands.length).toBe(2);
      expect(hands[0].length).toBe(2);
      expect(hands[1].length).toBe(2);
      expect(deck.size).toBe(1);
    });

    it('should deal cards in round-robin fashion', () => {
      const hands = deck.deal(2, 2);

      // First round: player 0 gets card5, player 1 gets card4
      expect(hands[0][0]).toBe(card5);
      expect(hands[1][0]).toBe(card4);

      // Second round: player 0 gets card3, player 1 gets card2
      expect(hands[0][1]).toBe(card3);
      expect(hands[1][1]).toBe(card2);
    });

    it('should handle uneven deals gracefully', () => {
      const hands = deck.deal(3, 2);

      // 3 players, 2 cards each = 6 cards needed, but only 5 available
      expect(hands[0].length).toBe(2);
      expect(hands[1].length).toBe(2);
      expect(hands[2].length).toBe(1); // Last player gets fewer cards
    });

    it('should return empty arrays when deck is empty', () => {
      const emptyDeck = new Deck<TestCardProps>();
      const hands = emptyDeck.deal(2, 3);

      expect(hands.length).toBe(2);
      expect(hands[0]).toEqual([]);
      expect(hands[1]).toEqual([]);
    });
  });

  describe('peekTop', () => {
    it('should return top card without removing it', () => {
      const top = deck.peekTop();

      expect(top).toBe(card5);
      expect(deck.size).toBe(5);
    });

    it('should return undefined for empty deck', () => {
      const emptyDeck = new Deck<TestCardProps>();
      const top = emptyDeck.peekTop();

      expect(top).toBeUndefined();
    });
  });

  describe('peekBottom', () => {
    it('should return bottom card without removing it', () => {
      const bottom = deck.peekBottom();

      expect(bottom).toBe(card1);
      expect(deck.size).toBe(5);
    });

    it('should return undefined for empty deck', () => {
      const emptyDeck = new Deck<TestCardProps>();
      const bottom = emptyDeck.peekBottom();

      expect(bottom).toBeUndefined();
    });
  });

  describe('cut', () => {
    it('should cut deck at specified position', () => {
      deck.cut(2);

      // After cutting 2 cards from top, order should be: 3, 4, 5, 1, 2
      expect(deck.peek(0)).toBe(card3);
      expect(deck.peek(1)).toBe(card4);
      expect(deck.peek(2)).toBe(card5);
      expect(deck.peek(3)).toBe(card1);
      expect(deck.peek(4)).toBe(card2);
    });

    it('should cut at middle by default', () => {
      deck.cut();

      // Middle of 5 cards is position 2
      expect(deck.peek(0)).toBe(card3);
      expect(deck.peek(4)).toBe(card2);
    });

    it('should maintain deck size after cut', () => {
      deck.cut(3);

      expect(deck.size).toBe(5);
    });

    it('should be chainable', () => {
      const result = deck.cut(2);

      expect(result).toBe(deck);
    });

    it('should not change deck if cut position is invalid', () => {
      const originalOrder = [...deck.allCards];

      deck.cut(0);
      expect(deck.allCards).toEqual(originalOrder);

      deck.cut(5);
      expect(deck.allCards).toEqual(originalOrder);

      deck.cut(-1);
      expect(deck.allCards).toEqual(originalOrder);
    });
  });

  describe('sort', () => {
    it('should sort cards according to comparison function', () => {
      deck.sort((a, b) => a.getProperty('value') - b.getProperty('value'));

      expect(deck.peek(0)?.getProperty('value')).toBe(1);
      expect(deck.peek(1)?.getProperty('value')).toBe(2);
      expect(deck.peek(4)?.getProperty('value')).toBe(5);
    });

    it('should sort in descending order', () => {
      deck.sort((a, b) => b.getProperty('value') - a.getProperty('value'));

      expect(deck.peek(0)?.getProperty('value')).toBe(5);
      expect(deck.peek(4)?.getProperty('value')).toBe(1);
    });

    it('should be chainable', () => {
      const result = deck.sort((a, b) => a.getProperty('value') - b.getProperty('value'));

      expect(result).toBe(deck);
    });

    it('should maintain deck size', () => {
      deck.sort((a, b) => a.getProperty('value') - b.getProperty('value'));

      expect(deck.size).toBe(5);
    });
  });

  describe('createStandardDeck', () => {
    it('should create a deck with 52 cards', () => {
      const standardDeck = Deck.createStandardDeck();

      expect(standardDeck.size).toBe(52);
    });

    it('should have 4 suits', () => {
      const standardDeck = Deck.createStandardDeck();
      const suits = new Set(standardDeck.allCards.map(c => c.getProperty('suit')));

      expect(suits.size).toBe(4);
      expect(suits.has('hearts')).toBe(true);
      expect(suits.has('diamonds')).toBe(true);
      expect(suits.has('clubs')).toBe(true);
      expect(suits.has('spades')).toBe(true);
    });

    it('should have 13 ranks per suit', () => {
      const standardDeck = Deck.createStandardDeck();

      const heartCards = standardDeck.findAll(c => c.getProperty('suit') === 'hearts');
      expect(heartCards.length).toBe(13);

      const diamondCards = standardDeck.findAll(c => c.getProperty('suit') === 'diamonds');
      expect(diamondCards.length).toBe(13);
    });

    it('should have correct ranks', () => {
      const standardDeck = Deck.createStandardDeck();
      const ranks = new Set(standardDeck.allCards.map(c => c.getProperty('rank')));

      expect(ranks.size).toBe(13);
      expect(ranks.has('A')).toBe(true);
      expect(ranks.has('K')).toBe(true);
      expect(ranks.has('Q')).toBe(true);
      expect(ranks.has('J')).toBe(true);
      expect(ranks.has('2')).toBe(true);
    });

    it('should assign values from 1 to 13', () => {
      const standardDeck = Deck.createStandardDeck();
      const values = new Set(standardDeck.allCards.map(c => c.getProperty('value')));

      expect(values.size).toBe(13);
      for (let i = 1; i <= 13; i++) {
        expect(values.has(i)).toBe(true);
      }
    });
  });

  describe('integration - shuffle and deal', () => {
    it('should shuffle and deal cards correctly', () => {
      const standardDeck = Deck.createStandardDeck();
      standardDeck.shuffle();

      const hands = standardDeck.deal(4, 5);

      expect(hands.length).toBe(4);
      hands.forEach(hand => {
        expect(hand.length).toBe(5);
      });
      expect(standardDeck.size).toBe(32); // 52 - 20 dealt cards
    });
  });
});
