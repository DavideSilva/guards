import { describe, it, expect } from 'vitest';
import { Card } from '../src/core/Card';
import { BlackjackCard } from '../src/games/blackjack/types';
import {
  calculateHandScore,
  canSplit,
  canDouble,
  shouldDealerHit,
  compareHands,
  formatHandScore
} from '../src/games/blackjack/scoring';

// Helper to create blackjack cards
function makeCard(rank: BlackjackCard['rank'], suit: BlackjackCard['suit'] = 'hearts'): Card<BlackjackCard> {
  const value = rank === 'A' ? 1 : ['J', 'Q', 'K'].includes(rank) ? 10 : parseInt(rank);
  return new Card<BlackjackCard>({ rank, suit, value });
}

describe('Blackjack Scoring', () => {
  describe('calculateHandScore', () => {
    it('should calculate simple hand', () => {
      const cards = [makeCard('5'), makeCard('7')];
      const score = calculateHandScore(cards);

      expect(score.value).toBe(12);
      expect(score.isSoft).toBe(false);
      expect(score.isBust).toBe(false);
      expect(score.isBlackjack).toBe(false);
    });

    it('should detect Blackjack (Ace + 10)', () => {
      const cards = [makeCard('A'), makeCard('K')];
      const score = calculateHandScore(cards);

      expect(score.value).toBe(21);
      expect(score.isBlackjack).toBe(true);
    });

    it('should handle soft Ace (Ace as 11)', () => {
      const cards = [makeCard('A'), makeCard('6')];
      const score = calculateHandScore(cards);

      expect(score.value).toBe(17);
      expect(score.isSoft).toBe(true);
      expect(score.isBust).toBe(false);
    });

    it('should convert soft Ace to hard when needed', () => {
      const cards = [makeCard('A'), makeCard('6'), makeCard('10')];
      const score = calculateHandScore(cards);

      expect(score.value).toBe(17);
      expect(score.isSoft).toBe(false); // Had to count Ace as 1
    });

    it('should detect bust', () => {
      const cards = [makeCard('10'), makeCard('8'), makeCard('5')];
      const score = calculateHandScore(cards);

      expect(score.value).toBe(23);
      expect(score.isBust).toBe(true);
    });

    it('should handle multiple Aces', () => {
      const cards = [makeCard('A'), makeCard('A'), makeCard('9')];
      const score = calculateHandScore(cards);

      expect(score.value).toBe(21); // 11 + 1 + 9
      expect(score.isSoft).toBe(true);
    });

    it('should handle empty hand', () => {
      const score = calculateHandScore([]);

      expect(score.value).toBe(0);
      expect(score.isSoft).toBe(false);
    });

    it('should handle face cards', () => {
      const cards = [makeCard('J'), makeCard('Q'), makeCard('K')];
      const score = calculateHandScore(cards);

      expect(score.value).toBe(30);
      expect(score.isBust).toBe(true);
    });
  });

  describe('canSplit', () => {
    it('should allow splitting same ranks', () => {
      const cards = [makeCard('8'), makeCard('8')];
      expect(canSplit(cards)).toBe(true);
    });

    it('should allow splitting Aces', () => {
      const cards = [makeCard('A'), makeCard('A')];
      expect(canSplit(cards)).toBe(true);
    });

    it('should allow splitting 10-value cards', () => {
      const cards = [makeCard('10'), makeCard('K')];
      expect(canSplit(cards)).toBe(true);
    });

    it('should not allow splitting different ranks', () => {
      const cards = [makeCard('8'), makeCard('9')];
      expect(canSplit(cards)).toBe(false);
    });

    it('should not allow splitting with more than 2 cards', () => {
      const cards = [makeCard('8'), makeCard('8'), makeCard('5')];
      expect(canSplit(cards)).toBe(false);
    });

    it('should not allow splitting with 1 card', () => {
      const cards = [makeCard('8')];
      expect(canSplit(cards)).toBe(false);
    });
  });

  describe('canDouble', () => {
    it('should allow doubling on initial 2 cards', () => {
      const cards = [makeCard('5'), makeCard('6')];
      expect(canDouble(cards)).toBe(true);
    });

    it('should not allow doubling after 2 cards', () => {
      const cards = [makeCard('5'), makeCard('6'), makeCard('3')];
      expect(canDouble(cards)).toBe(false);
    });

    it('should not allow doubling with 1 card', () => {
      const cards = [makeCard('5')];
      expect(canDouble(cards)).toBe(false);
    });
  });

  describe('shouldDealerHit', () => {
    it('should hit on 16 or less', () => {
      const score = calculateHandScore([makeCard('10'), makeCard('6')]);
      expect(shouldDealerHit(score, true)).toBe(true);
    });

    it('should stand on hard 17', () => {
      const score = calculateHandScore([makeCard('10'), makeCard('7')]);
      expect(shouldDealerHit(score, true)).toBe(false);
    });

    it('should stand on soft 17 when rule is true', () => {
      const score = calculateHandScore([makeCard('A'), makeCard('6')]);
      expect(shouldDealerHit(score, true)).toBe(false);
    });

    it('should hit on soft 17 when rule is false', () => {
      const score = calculateHandScore([makeCard('A'), makeCard('6')]);
      expect(shouldDealerHit(score, false)).toBe(true);
    });

    it('should stand on 18 or more', () => {
      const score = calculateHandScore([makeCard('10'), makeCard('8')]);
      expect(shouldDealerHit(score, false)).toBe(false);
    });

    it('should not hit on bust', () => {
      const score = calculateHandScore([makeCard('10'), makeCard('10'), makeCard('5')]);
      expect(shouldDealerHit(score, false)).toBe(false);
    });
  });

  describe('compareHands', () => {
    it('should return LOSE when player busts', () => {
      const playerScore = calculateHandScore([makeCard('10'), makeCard('10'), makeCard('5')]);
      const dealerScore = calculateHandScore([makeCard('10'), makeCard('7')]);

      expect(compareHands(playerScore, dealerScore)).toBe('LOSE');
    });

    it('should return BLACKJACK when only player has blackjack', () => {
      const playerScore = calculateHandScore([makeCard('A'), makeCard('K')]);
      const dealerScore = calculateHandScore([makeCard('10'), makeCard('9')]);

      expect(compareHands(playerScore, dealerScore)).toBe('BLACKJACK');
    });

    it('should return PUSH when both have blackjack', () => {
      const playerScore = calculateHandScore([makeCard('A'), makeCard('K')]);
      const dealerScore = calculateHandScore([makeCard('A'), makeCard('Q')]);

      expect(compareHands(playerScore, dealerScore)).toBe('PUSH');
    });

    it('should return WIN when dealer busts', () => {
      const playerScore = calculateHandScore([makeCard('10'), makeCard('7')]);
      const dealerScore = calculateHandScore([makeCard('10'), makeCard('10'), makeCard('5')]);

      expect(compareHands(playerScore, dealerScore)).toBe('WIN');
    });

    it('should return WIN when player has higher value', () => {
      const playerScore = calculateHandScore([makeCard('10'), makeCard('9')]);
      const dealerScore = calculateHandScore([makeCard('10'), makeCard('7')]);

      expect(compareHands(playerScore, dealerScore)).toBe('WIN');
    });

    it('should return LOSE when dealer has higher value', () => {
      const playerScore = calculateHandScore([makeCard('10'), makeCard('7')]);
      const dealerScore = calculateHandScore([makeCard('10'), makeCard('9')]);

      expect(compareHands(playerScore, dealerScore)).toBe('LOSE');
    });

    it('should return PUSH on tie', () => {
      const playerScore = calculateHandScore([makeCard('10'), makeCard('8')]);
      const dealerScore = calculateHandScore([makeCard('9'), makeCard('9')]);

      expect(compareHands(playerScore, dealerScore)).toBe('PUSH');
    });
  });

  describe('formatHandScore', () => {
    it('should format bust', () => {
      const score = calculateHandScore([makeCard('10'), makeCard('10'), makeCard('5')]);
      expect(formatHandScore(score)).toBe('BUST (25)');
    });

    it('should format blackjack', () => {
      const score = calculateHandScore([makeCard('A'), makeCard('K')]);
      expect(formatHandScore(score)).toBe('BLACKJACK!');
    });

    it('should format soft hand', () => {
      const score = calculateHandScore([makeCard('A'), makeCard('6')]);
      expect(formatHandScore(score)).toBe('Soft 17');
    });

    it('should format hard hand', () => {
      const score = calculateHandScore([makeCard('10'), makeCard('7')]);
      expect(formatHandScore(score)).toBe('17');
    });

    it('should not show soft for 21', () => {
      const score = calculateHandScore([makeCard('A'), makeCard('5'), makeCard('5')]);
      expect(formatHandScore(score)).toBe('21');
    });
  });
});
