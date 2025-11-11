/**
 * Common types and enums for game state management
 */

/**
 * Game state enum
 */
export enum GameState {
  /** Game is being set up */
  SETUP = 'SETUP',
  /** Game is ready to start */
  READY = 'READY',
  /** Game is in progress */
  PLAYING = 'PLAYING',
  /** Game is paused */
  PAUSED = 'PAUSED',
  /** Game has ended */
  ENDED = 'ENDED'
}

/**
 * Game event types
 */
export enum GameEventType {
  /** Game has started */
  GAME_STARTED = 'GAME_STARTED',
  /** Game has ended */
  GAME_ENDED = 'GAME_ENDED',
  /** Game has been paused */
  GAME_PAUSED = 'GAME_PAUSED',
  /** Game has been resumed */
  GAME_RESUMED = 'GAME_RESUMED',
  /** Turn has changed */
  TURN_CHANGED = 'TURN_CHANGED',
  /** Player has joined */
  PLAYER_JOINED = 'PLAYER_JOINED',
  /** Player has left */
  PLAYER_LEFT = 'PLAYER_LEFT',
  /** Game state has changed */
  STATE_CHANGED = 'STATE_CHANGED'
}

/**
 * Base game event
 */
export interface GameEvent {
  type: GameEventType;
  timestamp: Date;
  data?: any;
}

/**
 * Game event listener
 */
export type GameEventListener = (event: GameEvent) => void;

/**
 * Player status
 */
export enum PlayerStatus {
  /** Player is active */
  ACTIVE = 'ACTIVE',
  /** Player is waiting */
  WAITING = 'WAITING',
  /** Player has folded/quit */
  FOLDED = 'FOLDED',
  /** Player is disconnected */
  DISCONNECTED = 'DISCONNECTED'
}

/**
 * Game configuration options
 */
export interface GameConfig {
  /** Minimum number of players */
  minPlayers: number;
  /** Maximum number of players */
  maxPlayers: number;
  /** Game-specific settings */
  [key: string]: any;
}

/**
 * Game result for a player
 */
export interface PlayerResult {
  playerId: string;
  score: number;
  winner: boolean;
  metadata?: Record<string, any>;
}

/**
 * Complete game result
 */
export interface GameResult {
  gameId: string;
  startTime: Date;
  endTime: Date;
  players: PlayerResult[];
  metadata?: Record<string, any>;
}
