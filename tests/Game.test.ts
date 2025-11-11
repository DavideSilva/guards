import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Game } from '../src/game/Game';
import { Player } from '../src/game/Player';
import { GameState, GameEventType, GameConfig } from '../src/game/types';

interface TestCardProps {
  value: number;
  suit: string;
}

// Create a concrete implementation of Game for testing
class TestGame extends Game<TestCardProps> {
  onGameStartCalled = false;
  onGameEndCalled = false;
  onTurnChangedCalled = false;

  protected onGameStart(): void {
    this.onGameStartCalled = true;
  }

  protected onGameEnd(): void {
    this.onGameEndCalled = true;
  }

  protected onTurnChanged(): void {
    this.onTurnChangedCalled = true;
  }
}

describe('Game', () => {
  let game: TestGame;
  let config: GameConfig;
  let player1: Player<TestCardProps>;
  let player2: Player<TestCardProps>;
  let player3: Player<TestCardProps>;

  beforeEach(() => {
    config = {
      minPlayers: 2,
      maxPlayers: 4
    };
    game = new TestGame(config);
    player1 = new Player<TestCardProps>('p1', 'Alice');
    player2 = new Player<TestCardProps>('p2', 'Bob');
    player3 = new Player<TestCardProps>('p3', 'Charlie');
  });

  describe('constructor', () => {
    it('should create a game with config', () => {
      expect(game.config.minPlayers).toBe(2);
      expect(game.config.maxPlayers).toBe(4);
    });

    it('should start in SETUP state', () => {
      expect(game.state).toBe(GameState.SETUP);
    });

    it('should have no players initially', () => {
      expect(game.playerCount).toBe(0);
      expect(game.players).toEqual([]);
    });

    it('should generate a unique ID', () => {
      const game2 = new TestGame(config);
      expect(game.id).not.toBe(game2.id);
    });
  });

  describe('addPlayer', () => {
    it('should add a player', () => {
      game.addPlayer(player1);

      expect(game.playerCount).toBe(1);
      expect(game.players[0]).toBe(player1);
    });

    it('should emit PLAYER_JOINED event', () => {
      const listener = vi.fn();
      game.on(GameEventType.PLAYER_JOINED, listener);

      game.addPlayer(player1);

      expect(listener).toHaveBeenCalledOnce();
    });

    it('should transition to READY when min players reached', () => {
      game.addPlayer(player1);
      expect(game.state).toBe(GameState.SETUP);

      game.addPlayer(player2);
      expect(game.state).toBe(GameState.READY);
    });

    it('should emit STATE_CHANGED when transitioning to READY', () => {
      const listener = vi.fn();
      game.on(GameEventType.STATE_CHANGED, listener);

      game.addPlayer(player1);
      game.addPlayer(player2);

      expect(listener).toHaveBeenCalled();
    });

    it('should throw error if game has started', () => {
      game.addPlayer(player1);
      game.addPlayer(player2);
      game.start();

      expect(() => game.addPlayer(player3)).toThrow('Cannot add player after game has started');
    });

    it('should throw error if max players reached', () => {
      game.addPlayer(player1);
      game.addPlayer(player2);
      game.addPlayer(player3);
      const player4 = new Player<TestCardProps>('p4', 'David');
      game.addPlayer(player4);

      const player5 = new Player<TestCardProps>('p5', 'Eve');
      expect(() => game.addPlayer(player5)).toThrow('Maximum number of players');
    });

    it('should throw error if player ID already exists', () => {
      game.addPlayer(player1);

      const duplicatePlayer = new Player<TestCardProps>('p1', 'Alice Clone');
      expect(() => game.addPlayer(duplicatePlayer)).toThrow('already exists');
    });
  });

  describe('removePlayer', () => {
    beforeEach(() => {
      game.addPlayer(player1);
      game.addPlayer(player2);
    });

    it('should remove a player', () => {
      game.removePlayer('p1');

      expect(game.playerCount).toBe(1);
      expect(game.players[0]).toBe(player2);
    });

    it('should emit PLAYER_LEFT event', () => {
      const listener = vi.fn();
      game.on(GameEventType.PLAYER_LEFT, listener);

      game.removePlayer('p1');

      expect(listener).toHaveBeenCalledOnce();
    });

    it('should transition to SETUP when below min players', () => {
      expect(game.state).toBe(GameState.READY);

      game.removePlayer('p1');

      expect(game.state).toBe(GameState.SETUP);
    });

    it('should throw error if game has started', () => {
      game.start();

      expect(() => game.removePlayer('p1')).toThrow('Cannot remove player after game has started');
    });

    it('should throw error if player not found', () => {
      expect(() => game.removePlayer('nonexistent')).toThrow('not found');
    });
  });

  describe('getPlayer', () => {
    beforeEach(() => {
      game.addPlayer(player1);
      game.addPlayer(player2);
    });

    it('should get player by ID', () => {
      const found = game.getPlayer('p1');
      expect(found).toBe(player1);
    });

    it('should return undefined for non-existent player', () => {
      const found = game.getPlayer('nonexistent');
      expect(found).toBeUndefined();
    });
  });

  describe('start', () => {
    beforeEach(() => {
      game.addPlayer(player1);
      game.addPlayer(player2);
    });

    it('should start the game', () => {
      game.start();

      expect(game.state).toBe(GameState.PLAYING);
      expect(game.hasStarted).toBe(true);
    });

    it('should emit GAME_STARTED event', () => {
      const listener = vi.fn();
      game.on(GameEventType.GAME_STARTED, listener);

      game.start();

      expect(listener).toHaveBeenCalledOnce();
    });

    it('should call onGameStart hook', () => {
      game.start();

      expect(game.onGameStartCalled).toBe(true);
    });

    it('should throw error if not in READY state', () => {
      game.removePlayer('p1');
      expect(game.state).toBe(GameState.SETUP);

      expect(() => game.start()).toThrow('Cannot start game');
    });

    it('should throw error if already started', () => {
      game.start();

      expect(() => game.start()).toThrow('Cannot start game');
    });
  });

  describe('end', () => {
    beforeEach(() => {
      game.addPlayer(player1);
      game.addPlayer(player2);
      game.start();
    });

    it('should end the game', () => {
      game.end();

      expect(game.state).toBe(GameState.ENDED);
      expect(game.hasEnded).toBe(true);
    });

    it('should emit GAME_ENDED event', () => {
      const listener = vi.fn();
      game.on(GameEventType.GAME_ENDED, listener);

      game.end();

      expect(listener).toHaveBeenCalledOnce();
    });

    it('should call onGameEnd hook', () => {
      game.end();

      expect(game.onGameEndCalled).toBe(true);
    });

    it('should throw error if not started', () => {
      const freshGame = new TestGame(config);
      expect(() => freshGame.end()).toThrow('Cannot end game');
    });
  });

  describe('pause and resume', () => {
    beforeEach(() => {
      game.addPlayer(player1);
      game.addPlayer(player2);
      game.start();
    });

    it('should pause the game', () => {
      game.pause();

      expect(game.state).toBe(GameState.PAUSED);
    });

    it('should emit GAME_PAUSED event', () => {
      const listener = vi.fn();
      game.on(GameEventType.GAME_PAUSED, listener);

      game.pause();

      expect(listener).toHaveBeenCalledOnce();
    });

    it('should resume the game', () => {
      game.pause();
      game.resume();

      expect(game.state).toBe(GameState.PLAYING);
    });

    it('should emit GAME_RESUMED event', () => {
      game.pause();

      const listener = vi.fn();
      game.on(GameEventType.GAME_RESUMED, listener);

      game.resume();

      expect(listener).toHaveBeenCalledOnce();
    });

    it('should throw error when pausing if not playing', () => {
      game.pause();

      expect(() => game.pause()).toThrow('Cannot pause game');
    });

    it('should throw error when resuming if not paused', () => {
      expect(() => game.resume()).toThrow('Cannot resume game');
    });
  });

  describe('turn management', () => {
    beforeEach(() => {
      game.addPlayer(player1);
      game.addPlayer(player2);
      game.addPlayer(player3);
      game.start();
    });

    it('should start with first player', () => {
      expect(game.currentPlayer).toBe(player1);
      expect(game.currentPlayerIndex).toBe(0);
    });

    it('should advance to next player', () => {
      game.nextTurn();

      expect(game.currentPlayer).toBe(player2);
      expect(game.currentPlayerIndex).toBe(1);
    });

    it('should wrap around to first player', () => {
      game.nextTurn(); // Player 2
      game.nextTurn(); // Player 3
      game.nextTurn(); // Back to Player 1

      expect(game.currentPlayer).toBe(player1);
      expect(game.currentPlayerIndex).toBe(0);
    });

    it('should emit TURN_CHANGED event', () => {
      const listener = vi.fn();
      game.on(GameEventType.TURN_CHANGED, listener);

      game.nextTurn();

      expect(listener).toHaveBeenCalledOnce();
    });

    it('should call onTurnChanged hook', () => {
      game.nextTurn();

      expect(game.onTurnChangedCalled).toBe(true);
    });

    it('should set current player by index', () => {
      game.setCurrentPlayer(2);

      expect(game.currentPlayer).toBe(player3);
      expect(game.currentPlayerIndex).toBe(2);
    });

    it('should throw error for invalid player index', () => {
      expect(() => game.setCurrentPlayer(99)).toThrow('Invalid player index');
      expect(() => game.setCurrentPlayer(-1)).toThrow('Invalid player index');
    });
  });

  describe('event system', () => {
    it('should register and emit events', () => {
      const listener = vi.fn();
      game.on(GameEventType.GAME_STARTED, listener);

      game.addPlayer(player1);
      game.addPlayer(player2);
      game.start();

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: GameEventType.GAME_STARTED,
          timestamp: expect.any(Date)
        })
      );
    });

    it('should unregister events', () => {
      const listener = vi.fn();
      game.on(GameEventType.GAME_STARTED, listener);
      game.off(GameEventType.GAME_STARTED, listener);

      game.addPlayer(player1);
      game.addPlayer(player2);
      game.start();

      expect(listener).not.toHaveBeenCalled();
    });

    it('should support multiple listeners for same event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      game.on(GameEventType.GAME_STARTED, listener1);
      game.on(GameEventType.GAME_STARTED, listener2);

      game.addPlayer(player1);
      game.addPlayer(player2);
      game.start();

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe('getResult', () => {
    beforeEach(() => {
      game.addPlayer(player1);
      game.addPlayer(player2);
      player1.score = 100;
      player2.score = 75;
      game.start();
      game.end();
    });

    it('should return game result after game ends', () => {
      const result = game.getResult();

      expect(result.gameId).toBe(game.id);
      expect(result.startTime).toBeInstanceOf(Date);
      expect(result.endTime).toBeInstanceOf(Date);
      expect(result.players.length).toBe(2);
    });

    it('should include player results with scores', () => {
      const result = game.getResult();

      expect(result.players[0].playerId).toBe('p1');
      expect(result.players[0].score).toBe(100);

      expect(result.players[1].playerId).toBe('p2');
      expect(result.players[1].score).toBe(75);
    });

    it('should throw error if game has not ended', () => {
      const activeGame = new TestGame(config);
      activeGame.addPlayer(player1);
      activeGame.addPlayer(player2);
      activeGame.start();

      expect(() => activeGame.getResult()).toThrow('Cannot get result before game has ended');
    });
  });

  describe('integration scenarios', () => {
    it('should handle a complete game flow', () => {
      // Setup
      expect(game.state).toBe(GameState.SETUP);

      // Add players
      game.addPlayer(player1);
      game.addPlayer(player2);
      expect(game.state).toBe(GameState.READY);

      // Start
      game.start();
      expect(game.state).toBe(GameState.PLAYING);
      expect(game.hasStarted).toBe(true);

      // Play turns
      expect(game.currentPlayer).toBe(player1);
      game.nextTurn();
      expect(game.currentPlayer).toBe(player2);

      // End
      game.end();
      expect(game.state).toBe(GameState.ENDED);
      expect(game.hasEnded).toBe(true);

      // Get result
      const result = game.getResult();
      expect(result.players.length).toBe(2);
    });
  });
});
