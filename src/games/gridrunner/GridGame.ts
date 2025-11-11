/**
 * GridRunner Game Implementation
 *
 * A grid-based movement game where players use cards to move across a customizable grid
 */

import { Game } from '../../game/Game';
import { Player } from '../../game/Player';
import { Deck } from '../../core/Deck';
import { Card } from '../../core/Card';
import { GameState } from '../../game/types';
import { Grid, SquareGrid } from './Grid';
import { HexGrid } from './HexGrid';
import {
  GridGameConfig,
  GridType,
  GridPlayerState,
  MovementCard,
  Position,
  MoveResult,
  GridGamePhase,
  CellType,
  MovementCardSpecial,
} from './types';
import {
  findPath,
  isValidMove,
  positionsEqual,
  calculatePositionScore,
  clonePosition,
  getReachablePositions,
} from './utils';
import { createStandardDeck } from './deckBuilder';

/**
 * GridRunner Game Class
 */
export class GridGame extends Game<MovementCard> {
  private gridConfig: GridGameConfig;
  private grid: Grid;
  private deck: Deck<MovementCard>;
  private phase: GridGamePhase;
  private turnCount: number;

  constructor(config?: Partial<GridGameConfig>) {
    // Default configuration
    const defaultConfig: GridGameConfig = {
      gridType: GridType.SQUARE,
      width: 10,
      height: 10,
      minPlayers: 1,
      maxPlayers: 4,
      allowDiagonalMovement: false,
      startPositions: [{ q: 0, r: 0 }],
      goalPositions: [{ q: 9, r: 9 }],
      deckSize: 40,
      handSize: 5,
    };

    const fullConfig = { ...defaultConfig, ...config };
    super(fullConfig);

    this.gridConfig = fullConfig;
    this.phase = GridGamePhase.SETUP;
    this.turnCount = 0;

    // Initialize grid based on type
    if (this.gridConfig.gridType === GridType.HEXAGONAL) {
      this.grid = new HexGrid(this.gridConfig.width, this.gridConfig.height);
    } else {
      this.grid = new SquareGrid(
        this.gridConfig.width,
        this.gridConfig.height,
        this.gridConfig.allowDiagonalMovement
      );
    }

    // Setup grid cells
    this.setupGrid();

    // Create deck
    this.deck = createStandardDeck(this.gridConfig.deckSize, this.gridConfig.gridType);
    this.deck.shuffle();
  }

  /**
   * Setup the grid with blocked cells, goals, checkpoints, etc.
   */
  private setupGrid(): void {
    // Set start positions
    for (const pos of this.gridConfig.startPositions) {
      this.grid.setCellType(pos, CellType.START);
    }

    // Set goal positions
    for (const pos of this.gridConfig.goalPositions) {
      this.grid.setCellType(pos, CellType.GOAL);
    }

    // Set blocked cells
    if (this.gridConfig.blockedCells) {
      for (const pos of this.gridConfig.blockedCells) {
        this.grid.setCellType(pos, CellType.BLOCKED);
      }
    }

    // Set checkpoints
    if (this.gridConfig.checkpoints) {
      for (const pos of this.gridConfig.checkpoints) {
        this.grid.setCellType(pos, CellType.CHECKPOINT);
      }
    }
  }

  /**
   * Called when the game starts
   */
  protected onGameStart(): void {
    this.phase = GridGamePhase.PLAYING;
    this.turnCount = 0;

    // Place players on starting positions
    for (let i = 0; i < this._players.length; i++) {
      const player = this._players[i];
      const startPos =
        this.gridConfig.startPositions[i % this.gridConfig.startPositions.length];

      // Initialize player state
      const playerState: GridPlayerState = {
        position: clonePosition(startPos),
        score: 0,
        checkpointsReached: [],
      };

      player.metadata = playerState;

      // Place player on grid
      this.grid.occupyCell(startPos, player.id);

      // Deal initial hand
      this.dealCards(player.id, this.gridConfig.handSize);
    }
  }

  /**
   * Called when the game ends
   */
  protected onGameEnd(): void {
    this.phase = GridGamePhase.ENDED;

    // Calculate final scores
    for (const player of this._players) {
      const state = player.metadata as GridPlayerState;
      const finalScore = this.calculateFinalScore(player.id);
      state.score = finalScore;
    }
  }

  /**
   * Called when the turn changes
   */
  protected onTurnChanged(): void {
    this.turnCount++;

    // Draw a card for the new player if deck is not empty
    const current = this.currentPlayer;
    if (current && this.deck.size > 0) {
      this.dealCards(current.id, 1);
    }
  }

  /**
   * Deal cards to a player
   */
  private dealCards(playerId: string, count: number): void {
    const player = this.getPlayer(playerId);
    if (!player) return;

    for (let i = 0; i < count; i++) {
      if (this.deck.size === 0) break;
      const card = this.deck.draw();
      if (card) {
        player.hand.add(card);
      }
    }
  }

  /**
   * Play a movement card and move the player
   */
  public playCard(
    playerId: string,
    cardId: string,
    targetPosition: Position
  ): MoveResult {
    const player = this.getPlayer(playerId);
    if (!player) {
      return {
        success: false,
        startPosition: { q: 0, r: 0 },
        endPosition: { q: 0, r: 0 },
        path: [],
        message: 'Player not found',
      };
    }

    // Check if it's the player's turn
    if (this.currentPlayer?.id !== playerId) {
      return {
        success: false,
        startPosition: (player.metadata as GridPlayerState).position,
        endPosition: targetPosition,
        path: [],
        message: 'Not your turn',
      };
    }

    // Find the card in player's hand
    const card = player.hand.find((c) => c.getProperty('id') === cardId);
    if (!card) {
      return {
        success: false,
        startPosition: (player.metadata as GridPlayerState).position,
        endPosition: targetPosition,
        path: [],
        message: 'Card not found in hand',
      };
    }

    const state = player.metadata as GridPlayerState;
    const currentPosition = state.position;

    // Validate the move
    const cardProps = {
      id: card.getProperty('id'),
      type: card.getProperty('type'),
      distance: card.getProperty('distance'),
      direction: card.getProperty('direction'),
      special: card.getProperty('special'),
      name: card.getProperty('name'),
      description: card.getProperty('description'),
    };

    if (!isValidMove(this.grid, currentPosition, targetPosition, cardProps)) {
      return {
        success: false,
        startPosition: currentPosition,
        endPosition: targetPosition,
        path: [],
        message: 'Invalid move for this card',
      };
    }

    // Calculate the path
    const canJump = cardProps.special === MovementCardSpecial.JUMP;
    const path =
      cardProps.special === MovementCardSpecial.TELEPORT
        ? [currentPosition, targetPosition]
        : findPath(
            this.grid,
            currentPosition,
            targetPosition,
            cardProps.distance,
            canJump
          );

    if (!path) {
      return {
        success: false,
        startPosition: currentPosition,
        endPosition: targetPosition,
        path: [],
        message: 'No valid path to target position',
      };
    }

    // Execute the move
    this.grid.freeCell(currentPosition);
    this.grid.occupyCell(targetPosition, playerId);
    state.position = clonePosition(targetPosition);

    // Check if reached goal or checkpoint
    const targetCell = this.grid.getCell(targetPosition);
    const cellsReached: typeof targetCell[] = [];

    if (targetCell) {
      cellsReached.push(targetCell);

      if (targetCell.type === CellType.GOAL) {
        state.score += calculatePositionScore(this.grid, targetPosition);
        // Player reached goal - game might end
        this.checkWinCondition(playerId);
      } else if (targetCell.type === CellType.CHECKPOINT) {
        // Add checkpoint to player's reached checkpoints
        const checkpointId = this.gridConfig.checkpoints?.findIndex((pos) =>
          positionsEqual(pos, targetPosition)
        );
        if (
          checkpointId !== undefined &&
          checkpointId !== -1 &&
          !state.checkpointsReached.includes(checkpointId)
        ) {
          state.checkpointsReached.push(checkpointId);
          state.score += calculatePositionScore(this.grid, targetPosition);
        }
      }
    }

    // Remove the card from hand
    player.hand.remove((c) => c.getProperty('id') === cardId);

    // End turn
    this.nextTurn();

    return {
      success: true,
      startPosition: currentPosition,
      endPosition: targetPosition,
      path,
      message: 'Move successful',
      cellsReached,
    };
  }

  /**
   * Check if a player has won
   */
  private checkWinCondition(playerId: string): void {
    const player = this.getPlayer(playerId);
    if (!player) return;

    const state = player.metadata as GridPlayerState;

    // Check if player reached a goal
    const goalPositions = this.gridConfig.goalPositions;
    for (const goalPos of goalPositions) {
      if (positionsEqual(state.position, goalPos)) {
        this.end();
        return;
      }
    }
  }

  /**
   * Calculate final score for a player
   */
  private calculateFinalScore(playerId: string): number {
    const player = this.getPlayer(playerId);
    if (!player) return 0;

    const state = player.metadata as GridPlayerState;
    return state.score;
  }

  /**
   * Get reachable positions for a player with a specific card
   */
  public getReachablePositions(
    playerId: string,
    cardId: string
  ): Position[] {
    const player = this.getPlayer(playerId);
    if (!player) return [];

    const card = player.hand.find((c) => c.getProperty('id') === cardId);
    if (!card) return [];

    const state = player.metadata as GridPlayerState;
    const distance = card.getProperty('distance');
    const special = card.getProperty('special');

    const canJump = special === MovementCardSpecial.JUMP;

    return getReachablePositions(
      this.grid,
      state.position,
      distance,
      canJump
    );
  }

  /**
   * Get the grid
   */
  public getGrid(): Grid {
    return this.grid;
  }

  /**
   * Get game configuration
   */
  public getConfig(): GridGameConfig {
    return { ...this.config };
  }

  /**
   * Get current game phase
   */
  public getPhase(): GridGamePhase {
    return this.phase;
  }

  /**
   * Get turn count
   */
  public getTurnCount(): number {
    return this.turnCount;
  }

  /**
   * Get player position
   */
  public getPlayerPosition(playerId: string): Position | null {
    const player = this.getPlayer(playerId);
    if (!player) return null;

    const state = player.metadata as GridPlayerState;
    return clonePosition(state.position);
  }

  /**
   * Get player score
   */
  public getPlayerScore(playerId: string): number {
    const player = this.getPlayer(playerId);
    if (!player) return 0;

    const state = player.metadata as GridPlayerState;
    return state.score;
  }

  /**
   * Get game state snapshot for UI rendering
   */
  public getGameState(): {
    phase: GridGamePhase;
    turnCount: number;
    currentPlayerId: string | null;
    players: Array<{
      id: string;
      name: string;
      position: Position;
      score: number;
      handSize: number;
    }>;
    gridType: GridType;
    gridDimensions: { width: number; height: number };
  } {
    return {
      phase: this.phase,
      turnCount: this.turnCount,
      currentPlayerId: this.currentPlayer?.id || null,
      players: this._players.map((p) => {
        const state = p.metadata as GridPlayerState;
        return {
          id: p.id,
          name: p.name,
          position: clonePosition(state.position),
          score: state.score,
          handSize: p.hand.size,
        };
      }),
      gridType: this.gridConfig.gridType,
      gridDimensions: this.grid.getDimensions(),
    };
  }

  /**
   * Get grid game configuration
   */
  public getGridConfig(): GridGameConfig {
    return { ...this.gridConfig };
  }
}
