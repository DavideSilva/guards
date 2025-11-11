import { Card } from '../core/Card';
import { Hand } from '../core/Hand';
import { Deck } from '../core/Deck';
import { DiscardPile } from '../core/DiscardPile';

/**
 * Utilities for displaying card game elements in the terminal
 */
export class TerminalDisplay {
  /**
   * Card suit symbols
   */
  private static readonly SUITS = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠'
  };

  /**
   * ANSI color codes
   */
  private static readonly COLORS = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    black: '\x1b[30m',
    gray: '\x1b[90m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
  };

  /**
   * Displays a single card with ASCII art
   */
  static displayCard<T extends Record<string, unknown>>(
    card: Card<T>,
    index?: number
  ): void {
    const props = card.properties as any;

    // For standard playing cards
    if ('suit' in props && 'rank' in props) {
      const suit = props.suit as string;
      const rank = props.rank as string;
      const suitSymbol = this.SUITS[suit as keyof typeof this.SUITS] || suit;
      const color = (suit === 'hearts' || suit === 'diamonds')
        ? this.COLORS.red
        : this.COLORS.black;

      const indexStr = index !== undefined ? `[${index}] ` : '';
      console.log(
        `${indexStr}┌─────┐`
      );
      console.log(
        `    │${color}${rank.padEnd(2)}${this.COLORS.reset}   │`
      );
      console.log(
        `    │  ${color}${suitSymbol}${this.COLORS.reset}  │`
      );
      console.log(
        `    │   ${color}${rank.padStart(2)}${this.COLORS.reset}│`
      );
      console.log(
        `    └─────┘`
      );
    } else {
      // For custom cards, display properties
      const indexStr = index !== undefined ? `[${index}] ` : '';
      const propsStr = Object.entries(props)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      console.log(`${indexStr}Card(${propsStr})`);
    }
  }

  /**
   * Displays multiple cards horizontally
   */
  static displayCardsHorizontal<T extends Record<string, unknown>>(
    cards: readonly Card<T>[],
    showIndices: boolean = true
  ): void {
    if (cards.length === 0) {
      console.log('  (no cards)');
      return;
    }

    const props = cards[0].properties as any;
    const isStandardCard = 'suit' in props && 'rank' in props;

    if (isStandardCard) {
      // Display indices
      if (showIndices) {
        const indices = cards
          .map((_, i) => `[${i}]`.padEnd(8))
          .join('');
        console.log(`  ${indices}`);
      }

      // Top border
      const topBorder = cards.map(() => '┌─────┐').join(' ');
      console.log(`  ${topBorder}`);

      // Rank top
      const rankTop = cards.map(card => {
        const suit = (card.properties as any).suit;
        const rank = (card.properties as any).rank;
        const color = (suit === 'hearts' || suit === 'diamonds')
          ? this.COLORS.red
          : this.COLORS.black;
        return `│${color}${rank.padEnd(2)}${this.COLORS.reset}   │`;
      }).join(' ');
      console.log(`  ${rankTop}`);

      // Suit
      const suitLine = cards.map(card => {
        const suit = (card.properties as any).suit;
        const suitSymbol = this.SUITS[suit as keyof typeof this.SUITS] || suit;
        const color = (suit === 'hearts' || suit === 'diamonds')
          ? this.COLORS.red
          : this.COLORS.black;
        return `│  ${color}${suitSymbol}${this.COLORS.reset}  │`;
      }).join(' ');
      console.log(`  ${suitLine}`);

      // Rank bottom
      const rankBottom = cards.map(card => {
        const suit = (card.properties as any).suit;
        const rank = (card.properties as any).rank;
        const color = (suit === 'hearts' || suit === 'diamonds')
          ? this.COLORS.red
          : this.COLORS.black;
        return `│   ${color}${rank.padStart(2)}${this.COLORS.reset}│`;
      }).join(' ');
      console.log(`  ${rankBottom}`);

      // Bottom border
      const bottomBorder = cards.map(() => '└─────┘').join(' ');
      console.log(`  ${bottomBorder}`);
    } else {
      // Custom cards - simple list
      cards.forEach((card, i) => {
        const indexStr = showIndices ? `[${i}] ` : '';
        const propsStr = Object.entries(card.properties)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        console.log(`  ${indexStr}Card(${propsStr})`);
      });
    }
  }

  /**
   * Displays a player's hand
   */
  static displayHand<T extends Record<string, unknown>>(
    hand: Hand<T>,
    playerName: string = 'Player'
  ): void {
    console.log(`\n${this.COLORS.bold}${this.COLORS.cyan}${playerName}'s Hand${this.COLORS.reset}`);
    console.log(`  Cards: ${hand.size}${hand.maxSize ? `/${hand.maxSize}` : ''}`);

    if (hand.isEmpty) {
      console.log('  (empty hand)');
    } else {
      this.displayCardsHorizontal(hand.allCards);
    }
    console.log();
  }

  /**
   * Displays deck information
   */
  static displayDeck<T extends Record<string, unknown>>(
    deck: Deck<T>,
    showTop: boolean = false
  ): void {
    console.log(`\n${this.COLORS.bold}${this.COLORS.green}Deck${this.COLORS.reset}`);
    console.log(`  Cards remaining: ${deck.size}`);

    if (showTop && !deck.isEmpty) {
      console.log('  Top card:');
      const topCard = deck.peekTop();
      if (topCard) {
        this.displayCard(topCard);
      }
    }
    console.log();
  }

  /**
   * Displays discard pile information
   */
  static displayDiscardPile<T extends Record<string, unknown>>(
    pile: DiscardPile<T>,
    showTop: boolean = true
  ): void {
    console.log(`\n${this.COLORS.bold}${this.COLORS.yellow}Discard Pile${this.COLORS.reset}`);
    console.log(`  Cards: ${pile.size}`);

    if (showTop && !pile.isEmpty) {
      console.log('  Top card:');
      const topCard = pile.peekTop();
      if (topCard) {
        this.displayCard(topCard);
      }
    } else if (pile.isEmpty) {
      console.log('  (empty)');
    }
    console.log();
  }

  /**
   * Displays a header/title
   */
  static displayHeader(text: string): void {
    const line = '═'.repeat(text.length + 4);
    console.log(`\n${this.COLORS.bold}${this.COLORS.blue}${line}${this.COLORS.reset}`);
    console.log(`${this.COLORS.bold}${this.COLORS.blue}  ${text}${this.COLORS.reset}`);
    console.log(`${this.COLORS.bold}${this.COLORS.blue}${line}${this.COLORS.reset}\n`);
  }

  /**
   * Displays a message
   */
  static displayMessage(message: string, type: 'info' | 'success' | 'error' = 'info'): void {
    const colors = {
      info: this.COLORS.cyan,
      success: this.COLORS.green,
      error: this.COLORS.red
    };
    console.log(`${colors[type]}${message}${this.COLORS.reset}`);
  }

  /**
   * Clears the console
   */
  static clear(): void {
    console.clear();
  }

  /**
   * Displays a separator line
   */
  static displaySeparator(): void {
    console.log(`${this.COLORS.gray}${'─'.repeat(60)}${this.COLORS.reset}`);
  }
}
