import { describe, it, expect, beforeEach } from 'vitest';
import { BlackjackGame } from '../src/games/blackjack/BlackjackGame';
import { Player } from '../src/game/Player';
import { BlackjackCard } from '../src/games/blackjack/types';
import { GameState, PlayerStatus } from '../src/game/types';

describe('BlackjackGame', () => {
  let game: BlackjackGame;
  let player1: Player<BlackjackCard>;
  let player2: Player<BlackjackCard>;

  beforeEach(() => {
    game = new BlackjackGame();
    player1 = new Player<BlackjackCard>('p1', 'Alice');
    player2 = new Player<BlackjackCard>('p2', 'Bob');
  });

  describe('constructor', () => {
    it('should create a game with default config', () => {
      expect(game.state).toBe(GameState.SETUP);
      expect(game.dealerPlayer).toBeDefined();
      expect(game.round).toBe(0);
    });

    it('should create a game with custom config', () => {
      const customGame = new BlackjackGame({
        numDecks: 2,
        dealerStandsOnSoft17: false,
        blackjackPayout: 2.0
      });

      expect(customGame).toBeDefined();
    });
  });

  describe('game flow', () => {
    beforeEach(() => {
      game.addPlayer(player1);
    });

    it('should transition from SETUP to READY to PLAYING', () => {
      expect(game.state).toBe(GameState.READY);

      game.start();
      expect(game.state).toBe(GameState.PLAYING);
    });

    it('should deal cards when game starts', () => {
      game.start();

      expect(player1.cardCount).toBe(2);
      expect(game.dealerPlayer.cardCount).toBe(2);
      expect(game.round).toBe(1);
    });

    it('should allow starting new round', () => {
      game.start();
      expect(game.round).toBe(1);

      player1.status = PlayerStatus.WAITING;
      game.newRound();

      expect(game.round).toBe(2);
      expect(player1.cardCount).toBe(2);
    });
  });

  describe('player actions', () => {
    beforeEach(() => {
      game.addPlayer(player1);
      game.start();
    });

    it('should allow player to hit', () => {
      const initialCount = player1.cardCount;
      const card = game.hit('p1');

      expect(card).toBeDefined();
      expect(player1.cardCount).toBe(initialCount + 1);
    });

    it('should mark player as folded when busting', () => {
      // Force a bust by hitting until over 21
      while (player1.status === PlayerStatus.ACTIVE) {
        const score = game.getPlayerScore('p1');
        if (score.isBust) break;

        game.hit('p1');

        // Safety check to prevent infinite loop
        if (player1.cardCount > 10) break;
      }

      if (game.getPlayerScore('p1').isBust) {
        expect(player1.status).toBe(PlayerStatus.FOLDED);
      }
    });

    it('should allow player to stand', () => {
      game.stand('p1');

      expect(player1.status).toBe(PlayerStatus.WAITING);
    });

    it('should throw error when player hits after standing', () => {
      game.stand('p1');

      expect(() => game.hit('p1')).toThrow();
    });
  });

  describe('dealer logic', () => {
    beforeEach(() => {
      game.addPlayer(player1);
      game.start();
    });

    it('should reveal dealer cards after all players stand', () => {
      expect(game.isDealerRevealed).toBe(false);

      game.stand('p1');

      expect(game.isDealerRevealed).toBe(true);
    });

    it('should have dealer play after all players finish', () => {
      const dealerInitialCards = game.dealerPlayer.cardCount;

      game.stand('p1');

      // Dealer may have drawn more cards
      expect(game.dealerPlayer.cardCount).toBeGreaterThanOrEqual(dealerInitialCards);
    });
  });

  describe('scoring', () => {
    beforeEach(() => {
      game.addPlayer(player1);
      game.start();
    });

    it('should calculate player score', () => {
      const score = game.getPlayerScore('p1');

      expect(score.value).toBeGreaterThan(0);
      expect(score).toHaveProperty('isSoft');
      expect(score).toHaveProperty('isBust');
      expect(score).toHaveProperty('isBlackjack');
    });

    it('should calculate dealer score', () => {
      const score = game.getDealerScore();

      expect(score.value).toBeGreaterThan(0);
    });

    it('should get dealer visible card before reveal', () => {
      const visibleCard = game.getDealerVisibleCard();

      expect(visibleCard).toBeDefined();
      expect(visibleCard).toHaveProperty('properties');
    });
  });

  describe('available actions', () => {
    beforeEach(() => {
      game.addPlayer(player1);
      game.start();
    });

    it('should return available actions for active player', () => {
      const actions = game.getAvailableActions('p1');

      expect(actions).toContain('HIT');
      expect(actions).toContain('STAND');
    });

    it('should return empty actions for finished player', () => {
      game.stand('p1');

      const actions = game.getAvailableActions('p1');

      expect(actions).toEqual([]);
    });

    it('should include DOUBLE on initial hand', () => {
      const actions = game.getAvailableActions('p1');

      expect(actions).toContain('DOUBLE');
    });
  });

  describe('round resolution', () => {
    beforeEach(() => {
      game.addPlayer(player1);
      game.addPlayer(player2);
      game.start();
    });

    it('should store last result in player metadata', () => {
      game.stand('p1');
      game.stand('p2'); // This triggers resolution

      const result = game.getLastResult('p1');
      expect(result).toBeDefined();
      expect(['WIN', 'LOSE', 'PUSH', 'BLACKJACK']).toContain(result);
    });

    it('should update player scores based on results', () => {
      const initialScore = player1.score;

      game.stand('p1');
      game.stand('p2'); // This triggers resolution

      // Score may have changed (could win, lose, or push)
      expect(typeof player1.score).toBe('number');
    });
  });

  describe('multi-player', () => {
    beforeEach(() => {
      game.addPlayer(player1);
      game.addPlayer(player2);
      game.start();
    });

    it('should deal cards to all players', () => {
      expect(player1.cardCount).toBe(2);
      expect(player2.cardCount).toBe(2);
      expect(game.dealerPlayer.cardCount).toBe(2);
    });

    it('should allow each player to act independently', () => {
      game.hit('p1');
      expect(player1.cardCount).toBe(3);
      expect(player2.cardCount).toBe(2);

      game.stand('p2');
      expect(player2.status).toBe(PlayerStatus.WAITING);
      expect(player1.status).toBe(PlayerStatus.ACTIVE);
    });

    it('should play dealer after all players finish', () => {
      expect(game.isDealerRevealed).toBe(false);

      game.stand('p1');
      expect(game.isDealerRevealed).toBe(false); // p2 still playing

      game.stand('p2');
      expect(game.isDealerRevealed).toBe(true); // All done, dealer plays
    });
  });

  describe('edge cases', () => {
    it('should handle player not found', () => {
      game.addPlayer(player1);
      game.start();

      expect(() => game.hit('nonexistent')).toThrow();
    });

    it('should not allow dealing when not playing', () => {
      game.addPlayer(player1);

      expect(() => game.dealRound()).toThrow();
    });

    it('should not allow new round when not playing', () => {
      game.addPlayer(player1);

      expect(() => game.newRound()).toThrow();
    });
  });
});
