#!/usr/bin/env node

import * as readline from 'readline';
import { Deck } from '../src/core/Deck';
import { Hand } from '../src/core/Hand';
import { DiscardPile } from '../src/core/DiscardPile';
import { TerminalDisplay } from '../src/ui/TerminalDisplay';

/**
 * Interactive demo of the card game engine
 * Demonstrates drawing, displaying, playing, and discarding cards
 */

type StandardCardProps = { suit: string; rank: string; value: number };

class InteractiveDemo {
  private deck!: Deck<StandardCardProps>;
  private hand!: Hand<StandardCardProps>;
  private discardPile!: DiscardPile<StandardCardProps>;
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Initialize the game
   */
  private initialize(): void {
    this.deck = Deck.createStandardDeck();
    this.deck.shuffle();
    this.hand = new Hand<StandardCardProps>(7); // Max 7 cards
    this.discardPile = new DiscardPile<StandardCardProps>();

    TerminalDisplay.clear();
    TerminalDisplay.displayHeader('Card Game Engine - Interactive Demo');
    TerminalDisplay.displayMessage('Starting with a shuffled standard deck...', 'info');
  }

  /**
   * Display the current game state
   */
  private displayState(): void {
    console.log('\n');
    TerminalDisplay.displaySeparator();
    TerminalDisplay.displayDeck(this.deck);
    TerminalDisplay.displayHand(this.hand, 'Your');
    TerminalDisplay.displayDiscardPile(this.discardPile);
    TerminalDisplay.displaySeparator();
  }

  /**
   * Display available commands
   */
  private displayCommands(): void {
    console.log('\nAvailable commands:');
    console.log('  draw [n]     - Draw n cards from deck (default: 1)');
    console.log('  play <i>     - Play card at index i');
    console.log('  discard <i>  - Discard card at index i');
    console.log('  sort         - Sort your hand by value');
    console.log('  shuffle      - Shuffle the deck');
    console.log('  reshuffle    - Reshuffle discard pile back into deck');
    console.log('  clear        - Clear your entire hand');
    console.log('  help         - Show this help message');
    console.log('  quit         - Exit the demo');
    console.log();
  }

  /**
   * Handle user command
   */
  private async handleCommand(command: string): Promise<boolean> {
    const parts = command.trim().toLowerCase().split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    try {
      switch (cmd) {
        case 'draw': {
          const count = args[0] ? parseInt(args[0]) : 1;
          if (isNaN(count) || count < 1) {
            TerminalDisplay.displayMessage('Invalid number of cards', 'error');
            break;
          }

          if (this.hand.isFull) {
            TerminalDisplay.displayMessage('Your hand is full!', 'error');
            break;
          }

          const canDraw = Math.min(count, this.hand.remainingSlots ?? count, this.deck.size);
          if (canDraw === 0) {
            TerminalDisplay.displayMessage('Deck is empty! Use "reshuffle" to recycle discard pile.', 'error');
            break;
          }

          const drawn = this.deck.drawMany(canDraw);
          this.hand.addMany(drawn);
          TerminalDisplay.displayMessage(`Drew ${canDraw} card(s)`, 'success');
          break;
        }

        case 'play': {
          if (args.length === 0) {
            TerminalDisplay.displayMessage('Usage: play <index>', 'error');
            break;
          }

          const index = parseInt(args[0]);
          if (isNaN(index) || index < 0 || index >= this.hand.size) {
            TerminalDisplay.displayMessage('Invalid card index', 'error');
            break;
          }

          const card = this.hand.play(index);
          if (card) {
            this.discardPile.discard(card);
            const rank = card.getProperty('rank');
            const suit = card.getProperty('suit');
            TerminalDisplay.displayMessage(`Played ${rank} of ${suit}`, 'success');
          }
          break;
        }

        case 'discard': {
          if (args.length === 0) {
            TerminalDisplay.displayMessage('Usage: discard <index>', 'error');
            break;
          }

          const index = parseInt(args[0]);
          if (isNaN(index) || index < 0 || index >= this.hand.size) {
            TerminalDisplay.displayMessage('Invalid card index', 'error');
            break;
          }

          const card = this.hand.play(index);
          if (card) {
            this.discardPile.discard(card);
            const rank = card.getProperty('rank');
            const suit = card.getProperty('suit');
            TerminalDisplay.displayMessage(`Discarded ${rank} of ${suit}`, 'success');
          }
          break;
        }

        case 'sort': {
          this.hand.sort((a, b) => a.getProperty('value') - b.getProperty('value'));
          TerminalDisplay.displayMessage('Hand sorted by value', 'success');
          break;
        }

        case 'shuffle': {
          this.deck.shuffle();
          TerminalDisplay.displayMessage('Deck shuffled', 'success');
          break;
        }

        case 'reshuffle': {
          if (this.discardPile.isEmpty) {
            TerminalDisplay.displayMessage('Discard pile is empty!', 'error');
            break;
          }

          const cards = this.discardPile.takeAllAndShuffle(false);
          this.deck.addMany(cards);
          this.deck.shuffle();
          TerminalDisplay.displayMessage(
            `Reshuffled ${cards.length} card(s) from discard pile back into deck`,
            'success'
          );
          break;
        }

        case 'clear': {
          const discarded = this.hand.discardAll();
          this.discardPile.discardMany(discarded);
          TerminalDisplay.displayMessage(`Discarded all ${discarded.length} card(s)`, 'success');
          break;
        }

        case 'help': {
          this.displayCommands();
          return true;
        }

        case 'quit':
        case 'exit':
        case 'q': {
          TerminalDisplay.displayMessage('\nThanks for trying the demo! Goodbye!', 'info');
          return false;
        }

        case '': {
          // Empty command, just redisplay
          break;
        }

        default: {
          TerminalDisplay.displayMessage(`Unknown command: ${cmd}. Type "help" for available commands.`, 'error');
          break;
        }
      }
    } catch (error) {
      TerminalDisplay.displayMessage(`Error: ${(error as Error).message}`, 'error');
    }

    return true;
  }

  /**
   * Main game loop
   */
  private async gameLoop(): Promise<void> {
    this.displayState();
    this.displayCommands();

    return new Promise((resolve) => {
      const promptUser = () => {
        this.rl.question('> ', async (answer) => {
          const shouldContinue = await this.handleCommand(answer);

          if (!shouldContinue) {
            this.rl.close();
            resolve();
            return;
          }

          this.displayState();
          promptUser();
        });
      };

      promptUser();
    });
  }

  /**
   * Start the demo
   */
  async start(): Promise<void> {
    this.initialize();
    await this.gameLoop();
  }
}

// Run the demo
const demo = new InteractiveDemo();
demo.start().catch(console.error);
