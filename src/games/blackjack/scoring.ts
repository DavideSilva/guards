import { Card } from '../../core/Card';
import { HandScore, BlackjackCard } from './types';

/**
 * Utility functions for Blackjack scoring
 */

/**
 * Calculates the score of a Blackjack hand
 * Handles Ace values (1 or 11) optimally
 *
 * @param cards - Array of cards in the hand
 * @returns HandScore with value, soft/bust/blackjack status
 */
export function calculateHandScore(cards: readonly Card<BlackjackCard>[]): HandScore {
  if (cards.length === 0) {
    return {
      value: 0,
      isSoft: false,
      isBust: false,
      isBlackjack: false
    };
  }

  let total = 0;
  let aces = 0;

  // First pass: count all cards, treat Aces as 1
  for (const card of cards) {
    const rank = card.getProperty('rank');

    if (rank === 'A') {
      aces++;
      total += 1;
    } else if (rank === 'J' || rank === 'Q' || rank === 'K') {
      total += 10;
    } else {
      total += parseInt(rank);
    }
  }

  // Try to use one Ace as 11 if it doesn't bust
  let isSoft = false;
  if (aces > 0 && total + 10 <= 21) {
    total += 10; // Convert one Ace from 1 to 11
    isSoft = true;
  }

  const isBust = total > 21;
  const isBlackjack = cards.length === 2 && total === 21;

  return {
    value: total,
    isSoft,
    isBust,
    isBlackjack
  };
}

/**
 * Checks if a hand can be split (two cards of same rank)
 *
 * @param cards - Array of cards in the hand
 * @returns True if the hand can be split
 */
export function canSplit(cards: readonly Card<BlackjackCard>[]): boolean {
  if (cards.length !== 2) {
    return false;
  }

  const rank1 = cards[0].getProperty('rank');
  const rank2 = cards[1].getProperty('rank');

  // Can split same ranks or any two 10-value cards
  if (rank1 === rank2) {
    return true;
  }

  const tenCards = ['10', 'J', 'Q', 'K'];
  return tenCards.includes(rank1) && tenCards.includes(rank2);
}

/**
 * Checks if a hand can be doubled
 *
 * @param cards - Array of cards in the hand
 * @returns True if the hand can be doubled
 */
export function canDouble(cards: readonly Card<BlackjackCard>[]): boolean {
  // Can only double on first two cards
  return cards.length === 2;
}

/**
 * Determines if dealer should hit based on hand score and rules
 *
 * @param score - Current hand score
 * @param standsOnSoft17 - Whether dealer stands on soft 17
 * @returns True if dealer should hit
 */
export function shouldDealerHit(score: HandScore, standsOnSoft17: boolean): boolean {
  if (score.isBust) {
    return false;
  }

  // Dealer must hit on 16 or less
  if (score.value < 17) {
    return true;
  }

  // Dealer has 17 or more
  if (score.value > 17) {
    return false;
  }

  // Dealer has exactly 17
  if (standsOnSoft17) {
    return false; // Stand on soft 17
  } else {
    return score.isSoft; // Hit on soft 17, stand on hard 17
  }
}

/**
 * Compares player hand to dealer hand and determines result
 *
 * @param playerScore - Player's hand score
 * @param dealerScore - Dealer's hand score
 * @returns The result of the hand
 */
export function compareHands(playerScore: HandScore, dealerScore: HandScore): 'WIN' | 'LOSE' | 'PUSH' | 'BLACKJACK' {
  // Player busts = lose
  if (playerScore.isBust) {
    return 'LOSE';
  }

  // Player has blackjack
  if (playerScore.isBlackjack) {
    if (dealerScore.isBlackjack) {
      return 'PUSH'; // Both have blackjack
    }
    return 'BLACKJACK'; // Player blackjack wins
  }

  // Dealer busts = player wins
  if (dealerScore.isBust) {
    return 'WIN';
  }

  // Compare values
  if (playerScore.value > dealerScore.value) {
    return 'WIN';
  } else if (playerScore.value < dealerScore.value) {
    return 'LOSE';
  } else {
    return 'PUSH'; // Tie
  }
}

/**
 * Formats a hand score as a string for display
 *
 * @param score - The hand score
 * @returns Formatted string (e.g., "21", "Soft 17", "BUST")
 */
export function formatHandScore(score: HandScore): string {
  if (score.isBust) {
    return `BUST (${score.value})`;
  }

  if (score.isBlackjack) {
    return 'BLACKJACK!';
  }

  if (score.isSoft && score.value !== 21) {
    return `Soft ${score.value}`;
  }

  return `${score.value}`;
}
