/**
 * GridRunner Game Types
 *
 * A grid-based movement game where players use cards to move across a customizable grid
 */

/**
 * Grid type enumeration
 */
export enum GridType {
  SQUARE = 'SQUARE',
  HEXAGONAL = 'HEXAGONAL'
}

/**
 * Direction for square grids (4-directional or 8-directional)
 */
export enum SquareDirection {
  NORTH = 'NORTH',
  SOUTH = 'SOUTH',
  EAST = 'EAST',
  WEST = 'WEST',
  NORTHEAST = 'NORTHEAST',
  NORTHWEST = 'NORTHWEST',
  SOUTHEAST = 'SOUTHEAST',
  SOUTHWEST = 'SOUTHWEST'
}

/**
 * Direction for hexagonal grids (6-directional)
 * Using axial coordinate system (cube coordinates)
 */
export enum HexDirection {
  EAST = 'EAST',
  WEST = 'WEST',
  NORTHEAST = 'NORTHEAST',
  NORTHWEST = 'NORTHWEST',
  SOUTHEAST = 'SOUTHEAST',
  SOUTHWEST = 'SOUTHWEST'
}

/**
 * Position on a grid
 */
export interface Position {
  q: number; // column or axial q-coordinate
  r: number; // row or axial r-coordinate
}

/**
 * Cell state on the grid
 */
export enum CellType {
  EMPTY = 'EMPTY',
  BLOCKED = 'BLOCKED',
  START = 'START',
  GOAL = 'GOAL',
  CHECKPOINT = 'CHECKPOINT'
}

/**
 * Cell on the grid with its properties
 */
export interface GridCell {
  position: Position;
  type: CellType;
  occupiedBy?: string; // Player ID if occupied
  metadata?: Record<string, unknown>; // Custom properties
}

/**
 * Movement card properties
 */
export interface MovementCard extends Record<string, unknown> {
  id: string;
  type: 'movement';
  distance: number; // How many cells the card allows movement
  direction?: SquareDirection | HexDirection; // Optional: specific direction
  special?: MovementCardSpecial; // Optional: special abilities
  name: string;
  description: string;
}

/**
 * Special abilities for movement cards
 */
export enum MovementCardSpecial {
  JUMP = 'JUMP', // Can jump over blocked cells
  TELEPORT = 'TELEPORT', // Can teleport to any valid cell
  DIAGONAL = 'DIAGONAL', // Can move diagonally (for square grids)
  MULTI_TURN = 'MULTI_TURN', // Can choose direction at each step
}

/**
 * Player state in the grid game
 */
export interface GridPlayerState extends Record<string, unknown> {
  position: Position;
  score: number;
  checkpointsReached: number[];
  movesRemaining?: number;
}

/**
 * Game configuration
 */
export interface GridGameConfig {
  gridType: GridType;
  width: number;
  height: number;
  minPlayers: number;
  maxPlayers: number;
  allowDiagonalMovement: boolean; // For square grids
  startPositions: Position[];
  goalPositions: Position[];
  blockedCells?: Position[];
  checkpoints?: Position[];
  deckSize: number; // Number of movement cards in the deck
  handSize: number; // Number of cards each player holds
}

/**
 * Movement result after playing a card
 */
export interface MoveResult {
  success: boolean;
  startPosition: Position;
  endPosition: Position;
  path: Position[];
  message: string;
  cellsReached?: GridCell[];
}

/**
 * Game phase
 */
export enum GridGamePhase {
  SETUP = 'SETUP',
  PLAYING = 'PLAYING',
  ENDED = 'ENDED'
}
