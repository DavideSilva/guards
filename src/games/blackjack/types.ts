/**
 * Types and enums specific to Blackjack
 */

/**
 * Player action in Blackjack
 */
export enum BlackjackAction {
  /** Take another card */
  HIT = 'HIT',
  /** Keep current hand and end turn */
  STAND = 'STAND',
  /** Double the bet and take one more card */
  DOUBLE = 'DOUBLE',
  /** Split a pair into two hands */
  SPLIT = 'SPLIT'
}

/**
 * Result of a Blackjack hand
 */
export enum HandResult {
  /** Player wins */
  WIN = 'WIN',
  /** Player loses */
  LOSE = 'LOSE',
  /** Tie with dealer */
  PUSH = 'PUSH',
  /** Player got Blackjack (21 with 2 cards) */
  BLACKJACK = 'BLACKJACK',
  /** Player busted (over 21) */
  BUST = 'BUST',
  /** Hand is still in play */
  IN_PROGRESS = 'IN_PROGRESS'
}

/**
 * Blackjack game configuration
 */
export interface BlackjackConfig {
  minPlayers: number;
  maxPlayers: number;
  /** Number of decks to use */
  numDecks: number;
  /** Dealer stands on soft 17 */
  dealerStandsOnSoft17: boolean;
  /** Blackjack payout ratio (3:2 = 1.5) */
  blackjackPayout: number;
}

/**
 * Standard playing card properties for Blackjack
 */
export interface BlackjackCard {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
  value: number;
}

/**
 * Blackjack hand score
 */
export interface HandScore {
  /** Total value of the hand */
  value: number;
  /** Whether the hand contains a usable Ace (counted as 11) */
  isSoft: boolean;
  /** Whether the hand is a bust (over 21) */
  isBust: boolean;
  /** Whether the hand is a Blackjack (21 with 2 cards) */
  isBlackjack: boolean;
}
