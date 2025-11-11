import { Game } from '../../game/Game';
import { Player } from '../../game/Player';
import { Deck } from '../../core/Deck';
import { Card } from '../../core/Card';
import { PlayerStatus } from '../../game/types';
import {
  BlackjackCard,
  BlackjackConfig,
  BlackjackAction,
  HandScore
} from './types';
import {
  calculateHandScore,
  canSplit,
  canDouble,
  shouldDealerHit,
  compareHands
} from './scoring';

/**
 * Blackjack game implementation
 * Classic casino card game where players try to beat the dealer by getting 21 or close without busting
 */
export class BlackjackGame extends Game<BlackjackCard> {
  private deck: Deck<BlackjackCard>;
  private dealer: Player<BlackjackCard>;
  private blackjackConfig: BlackjackConfig;
  private currentRound: number;
  private dealerRevealed: boolean;

  /**
   * Creates a new Blackjack game
   * @param config - Blackjack configuration
   */
  constructor(config?: Partial<BlackjackConfig>) {
    const fullConfig: BlackjackConfig = {
      minPlayers: 1,
      maxPlayers: 7,
      numDecks: config?.numDecks ?? 6,
      dealerStandsOnSoft17: config?.dealerStandsOnSoft17 ?? true,
      blackjackPayout: config?.blackjackPayout ?? 1.5
    };

    super(fullConfig);

    this.blackjackConfig = fullConfig;
    this.deck = this.createShoe(fullConfig.numDecks);
    this.dealer = new Player<BlackjackCard>('dealer', 'Dealer');
    this.currentRound = 0;
    this.dealerRevealed = false;
  }

  /**
   * Gets the dealer
   */
  get dealerPlayer(): Player<BlackjackCard> {
    return this.dealer;
  }

  /**
   * Gets the current round number
   */
  get round(): number {
    return this.currentRound;
  }

  /**
   * Checks if dealer's cards are revealed
   */
  get isDealerRevealed(): boolean {
    return this.dealerRevealed;
  }

  /**
   * Creates a multi-deck shoe
   */
  private createShoe(numDecks: number): Deck<BlackjackCard> {
    const shoe = new Deck<BlackjackCard>();

    for (let d = 0; d < numDecks; d++) {
      const standardDeck = Deck.createStandardDeck();
      shoe.addMany(standardDeck.allCards as Card<BlackjackCard>[]);
    }

    shoe.shuffle();
    return shoe;
  }

  /**
   * Reshuffles the deck when running low on cards
   */
  private checkAndReshuffleIfNeeded(): void {
    // Reshuffle if less than 25% of cards remaining
    const threshold = this.blackjackConfig.numDecks * 52 * 0.25;

    if (this.deck.size < threshold) {
      this.deck = this.createShoe(this.blackjackConfig.numDecks);
    }
  }

  /**
   * Deals a new round
   */
  dealRound(): void {
    if (this._state !== 'PLAYING') {
      throw new Error('Cannot deal when game is not in PLAYING state');
    }

    this.checkAndReshuffleIfNeeded();
    this.currentRound++;
    this.dealerRevealed = false;

    // Clear all hands
    this.dealer.discardHand();
    this._players.forEach(player => {
      player.discardHand();
      player.status = PlayerStatus.ACTIVE;
    });

    // Deal initial cards (2 to each player and dealer)
    for (let i = 0; i < 2; i++) {
      // Deal to players
      for (const player of this._players) {
        const card = this.deck.draw();
        if (card) {
          player.addCard(card);
        }
      }

      // Deal to dealer
      const dealerCard = this.deck.draw();
      if (dealerCard) {
        this.dealer.addCard(dealerCard);
      }
    }

    // Check for dealer blackjack
    const dealerScore = this.getDealerScore();
    if (dealerScore.isBlackjack) {
      this.dealerRevealed = true;
      this.resolveRound();
    }
  }

  /**
   * Player hits (takes another card)
   * @param playerId - The player's ID
   * @returns The dealt card
   */
  hit(playerId: string): Card<BlackjackCard> | undefined {
    const player = this.getPlayer(playerId);
    if (!player) {
      throw new Error(`Player ${playerId} not found`);
    }

    if (player.status !== PlayerStatus.ACTIVE) {
      throw new Error('Player is not active');
    }

    const card = this.deck.draw();
    if (card) {
      player.addCard(card);

      // Check if player busted
      const score = this.getPlayerScore(playerId);
      if (score.isBust) {
        player.status = PlayerStatus.FOLDED;
      }
    }

    return card;
  }

  /**
   * Player stands (ends their turn)
   * @param playerId - The player's ID
   */
  stand(playerId: string): void {
    const player = this.getPlayer(playerId);
    if (!player) {
      throw new Error(`Player ${playerId} not found`);
    }

    if (player.status !== PlayerStatus.ACTIVE) {
      throw new Error('Player is not active');
    }

    player.status = PlayerStatus.WAITING;

    // If all players have finished, play dealer's hand
    if (this.allPlayersFinished()) {
      this.playDealerHand();
      this.resolveRound();
    }
  }

  /**
   * Player doubles down (doubles bet, takes one card, then stands)
   * @param playerId - The player's ID
   * @returns The dealt card
   */
  double(playerId: string): Card<BlackjackCard> | undefined {
    const player = this.getPlayer(playerId);
    if (!player) {
      throw new Error(`Player ${playerId} not found`);
    }

    if (!canDouble(player.hand.allCards)) {
      throw new Error('Cannot double on this hand');
    }

    if (player.status !== PlayerStatus.ACTIVE) {
      throw new Error('Player is not active');
    }

    // Hit once
    const card = this.hit(playerId);

    // Stand (unless busted)
    if (!this.getPlayerScore(playerId).isBust) {
      player.status = PlayerStatus.WAITING;
    }

    // If all players finished, play dealer
    if (this.allPlayersFinished()) {
      this.playDealerHand();
      this.resolveRound();
    }

    return card;
  }

  /**
   * Checks if all players have finished their turns
   */
  private allPlayersFinished(): boolean {
    return this._players.every(p =>
      p.status === PlayerStatus.WAITING || p.status === PlayerStatus.FOLDED
    );
  }

  /**
   * Plays out the dealer's hand according to rules
   */
  private playDealerHand(): void {
    this.dealerRevealed = true;

    let dealerScore = this.getDealerScore();

    // Dealer hits until rules say to stand
    while (shouldDealerHit(dealerScore, this.blackjackConfig.dealerStandsOnSoft17)) {
      const card = this.deck.draw();
      if (card) {
        this.dealer.addCard(card);
        dealerScore = this.getDealerScore();
      } else {
        break; // No more cards (shouldn't happen with multi-deck)
      }
    }
  }

  /**
   * Resolves the round by comparing all player hands to dealer
   */
  private resolveRound(): void {
    const dealerScore = this.getDealerScore();

    for (const player of this._players) {
      const playerScore = this.getPlayerScore(player.id);
      const result = compareHands(playerScore, dealerScore);

      // Update scores
      if (result === 'BLACKJACK') {
        player.addScore(Math.floor(this.blackjackConfig.blackjackPayout * 100));
      } else if (result === 'WIN') {
        player.addScore(100);
      } else if (result === 'PUSH') {
        // No score change
      } else {
        // LOSE - could subtract points if tracking losses
      }

      // Store result in metadata
      player.setMetadata('lastResult', result);
      player.setMetadata('lastHandScore', playerScore.value);
    }
  }

  /**
   * Gets a player's hand score
   * @param playerId - The player's ID
   * @returns The hand score
   */
  getPlayerScore(playerId: string): HandScore {
    const player = this.getPlayer(playerId);
    if (!player) {
      throw new Error(`Player ${playerId} not found`);
    }

    return calculateHandScore(player.hand.allCards);
  }

  /**
   * Gets the dealer's hand score
   * @returns The dealer's hand score
   */
  getDealerScore(): HandScore {
    return calculateHandScore(this.dealer.hand.allCards);
  }

  /**
   * Gets the dealer's visible card (first card)
   * Only shows one card until dealer's turn
   */
  getDealerVisibleCard(): Card<BlackjackCard> | undefined {
    return this.dealer.hand.peek(0);
  }

  /**
   * Gets available actions for a player
   * @param playerId - The player's ID
   * @returns Array of available actions
   */
  getAvailableActions(playerId: string): BlackjackAction[] {
    const player = this.getPlayer(playerId);
    if (!player || player.status !== PlayerStatus.ACTIVE) {
      return [];
    }

    const actions: BlackjackAction[] = [BlackjackAction.HIT, BlackjackAction.STAND];

    if (canDouble(player.hand.allCards)) {
      actions.push(BlackjackAction.DOUBLE);
    }

    if (canSplit(player.hand.allCards)) {
      actions.push(BlackjackAction.SPLIT);
    }

    return actions;
  }

  /**
   * Starts a new game
   */
  protected onGameStart(): void {
    // Deal first round
    this.dealRound();
  }

  /**
   * Called when game ends
   */
  protected onGameEnd(): void {
    // Game ended
  }

  /**
   * Called when turn changes (not used in Blackjack - simultaneous play)
   */
  protected onTurnChanged(): void {
    // Not used in Blackjack
  }

  /**
   * Starts a new round without restarting the game
   */
  newRound(): void {
    if (this._state !== 'PLAYING') {
      throw new Error('Game must be playing to start new round');
    }

    this.dealRound();
  }

  /**
   * Gets the result of the last round for a player
   * @param playerId - The player's ID
   * @returns The hand result
   */
  getLastResult(playerId: string): string | undefined {
    const player = this.getPlayer(playerId);
    return player?.getMetadata('lastResult');
  }
}
