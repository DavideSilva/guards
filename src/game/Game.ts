import { Player } from './Player';
import {
  GameState,
  GameEventType,
  GameEvent,
  GameEventListener,
  GameConfig,
  GameResult,
  PlayerResult
} from './types';

/**
 * Abstract base class for all card games
 * Provides game state management, player management, and event system
 *
 * @template T - The type of card properties
 */
export abstract class Game<T extends Record<string, unknown> = Record<string, unknown>> {
  protected _id: string;
  protected _state: GameState;
  protected _players: Player<T>[];
  protected _currentPlayerIndex: number;
  protected _config: GameConfig;
  protected _eventListeners: Map<GameEventType, GameEventListener[]>;
  protected _startTime?: Date;
  protected _endTime?: Date;

  /**
   * Creates a new Game
   * @param config - Game configuration
   */
  constructor(config: GameConfig) {
    this._id = this.generateGameId();
    this._state = GameState.SETUP;
    this._players = [];
    this._currentPlayerIndex = 0;
    this._config = config;
    this._eventListeners = new Map();
  }

  /**
   * Gets the game ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * Gets the current game state
   */
  get state(): GameState {
    return this._state;
  }

  /**
   * Gets all players
   */
  get players(): readonly Player<T>[] {
    return [...this._players];
  }

  /**
   * Gets the current player
   */
  get currentPlayer(): Player<T> | undefined {
    return this._players[this._currentPlayerIndex];
  }

  /**
   * Gets the current player index
   */
  get currentPlayerIndex(): number {
    return this._currentPlayerIndex;
  }

  /**
   * Gets the game configuration
   */
  get config(): Readonly<GameConfig> {
    return { ...this._config };
  }

  /**
   * Gets the number of players
   */
  get playerCount(): number {
    return this._players.length;
  }

  /**
   * Checks if the game has started
   */
  get hasStarted(): boolean {
    return this._state === GameState.PLAYING || this._state === GameState.PAUSED || this._state === GameState.ENDED;
  }

  /**
   * Checks if the game has ended
   */
  get hasEnded(): boolean {
    return this._state === GameState.ENDED;
  }

  /**
   * Adds a player to the game
   * @param player - The player to add
   * @throws Error if game has started or max players reached
   */
  addPlayer(player: Player<T>): void {
    if (this.hasStarted) {
      throw new Error('Cannot add player after game has started');
    }

    if (this._players.length >= this._config.maxPlayers) {
      throw new Error(`Maximum number of players (${this._config.maxPlayers}) reached`);
    }

    if (this._players.some(p => p.id === player.id)) {
      throw new Error(`Player with ID ${player.id} already exists in game`);
    }

    this._players.push(player);
    this.emit(GameEventType.PLAYER_JOINED, { player: player.toJSON() });

    if (this._players.length >= this._config.minPlayers && this._state === GameState.SETUP) {
      this._state = GameState.READY;
      this.emit(GameEventType.STATE_CHANGED, { state: this._state });
    }
  }

  /**
   * Removes a player from the game
   * @param playerId - The ID of the player to remove
   * @throws Error if game has started
   */
  removePlayer(playerId: string): void {
    if (this.hasStarted) {
      throw new Error('Cannot remove player after game has started');
    }

    const index = this._players.findIndex(p => p.id === playerId);
    if (index === -1) {
      throw new Error(`Player with ID ${playerId} not found`);
    }

    const player = this._players.splice(index, 1)[0];
    this.emit(GameEventType.PLAYER_LEFT, { player: player.toJSON() });

    if (this._players.length < this._config.minPlayers && this._state === GameState.READY) {
      this._state = GameState.SETUP;
      this.emit(GameEventType.STATE_CHANGED, { state: this._state });
    }
  }

  /**
   * Gets a player by ID
   * @param playerId - The player ID
   * @returns The player, or undefined if not found
   */
  getPlayer(playerId: string): Player<T> | undefined {
    return this._players.find(p => p.id === playerId);
  }

  /**
   * Starts the game
   * @throws Error if game is not ready or has already started
   */
  start(): void {
    if (this._state !== GameState.READY) {
      throw new Error(`Cannot start game in state: ${this._state}`);
    }

    if (this._players.length < this._config.minPlayers) {
      throw new Error(`Minimum ${this._config.minPlayers} players required`);
    }

    this._state = GameState.PLAYING;
    this._startTime = new Date();
    this.emit(GameEventType.GAME_STARTED, { timestamp: this._startTime });

    this.onGameStart();
  }

  /**
   * Ends the game
   * @throws Error if game has not started or has already ended
   */
  end(): void {
    if (!this.hasStarted || this.hasEnded) {
      throw new Error(`Cannot end game in state: ${this._state}`);
    }

    this._state = GameState.ENDED;
    this._endTime = new Date();
    this.emit(GameEventType.GAME_ENDED, { timestamp: this._endTime });

    this.onGameEnd();
  }

  /**
   * Pauses the game
   * @throws Error if game is not playing
   */
  pause(): void {
    if (this._state !== GameState.PLAYING) {
      throw new Error(`Cannot pause game in state: ${this._state}`);
    }

    this._state = GameState.PAUSED;
    this.emit(GameEventType.GAME_PAUSED, {});
  }

  /**
   * Resumes the game
   * @throws Error if game is not paused
   */
  resume(): void {
    if (this._state !== GameState.PAUSED) {
      throw new Error(`Cannot resume game in state: ${this._state}`);
    }

    this._state = GameState.PLAYING;
    this.emit(GameEventType.GAME_RESUMED, {});
  }

  /**
   * Advances to the next player's turn
   */
  nextTurn(): void {
    const previousIndex = this._currentPlayerIndex;
    this._currentPlayerIndex = (this._currentPlayerIndex + 1) % this._players.length;

    this.emit(GameEventType.TURN_CHANGED, {
      previousPlayer: this._players[previousIndex]?.toJSON(),
      currentPlayer: this.currentPlayer?.toJSON(),
      turnIndex: this._currentPlayerIndex
    });

    this.onTurnChanged();
  }

  /**
   * Sets the current player by index
   * @param index - The player index
   */
  setCurrentPlayer(index: number): void {
    if (index < 0 || index >= this._players.length) {
      throw new Error(`Invalid player index: ${index}`);
    }

    const previousIndex = this._currentPlayerIndex;
    this._currentPlayerIndex = index;

    this.emit(GameEventType.TURN_CHANGED, {
      previousPlayer: this._players[previousIndex]?.toJSON(),
      currentPlayer: this.currentPlayer?.toJSON(),
      turnIndex: this._currentPlayerIndex
    });
  }

  /**
   * Registers an event listener
   * @param eventType - The type of event to listen for
   * @param listener - The callback function
   */
  on(eventType: GameEventType, listener: GameEventListener): void {
    if (!this._eventListeners.has(eventType)) {
      this._eventListeners.set(eventType, []);
    }
    this._eventListeners.get(eventType)!.push(listener);
  }

  /**
   * Unregisters an event listener
   * @param eventType - The type of event
   * @param listener - The callback function to remove
   */
  off(eventType: GameEventType, listener: GameEventListener): void {
    const listeners = this._eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emits an event to all registered listeners
   * @param eventType - The type of event
   * @param data - Optional event data
   */
  protected emit(eventType: GameEventType, data?: any): void {
    const event: GameEvent = {
      type: eventType,
      timestamp: new Date(),
      data
    };

    const listeners = this._eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }
  }

  /**
   * Generates a unique game ID
   */
  protected generateGameId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Gets the game result
   * @returns The game result
   */
  getResult(): GameResult {
    if (!this.hasEnded) {
      throw new Error('Cannot get result before game has ended');
    }

    const playerResults: PlayerResult[] = this._players.map(player => ({
      playerId: player.id,
      score: player.score,
      winner: false // Will be determined by subclass
    }));

    return {
      gameId: this._id,
      startTime: this._startTime!,
      endTime: this._endTime!,
      players: playerResults
    };
  }

  /**
   * Abstract method called when game starts
   * Subclasses should implement game-specific initialization
   */
  protected abstract onGameStart(): void;

  /**
   * Abstract method called when game ends
   * Subclasses should implement game-specific cleanup
   */
  protected abstract onGameEnd(): void;

  /**
   * Abstract method called when turn changes
   * Subclasses can implement turn-specific logic
   */
  protected abstract onTurnChanged(): void;
}
