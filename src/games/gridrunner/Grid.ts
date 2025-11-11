/**
 * Grid System
 *
 * Abstract base class and implementations for square and hexagonal grids
 */

import {
  Position,
  GridCell,
  CellType,
  SquareDirection,
  HexDirection,
} from './types';

/**
 * Abstract base class for grid systems
 */
export abstract class Grid {
  protected cells: Map<string, GridCell>;
  protected width: number;
  protected height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.cells = new Map();
    this.initializeGrid();
  }

  /**
   * Initialize the grid with empty cells
   */
  protected abstract initializeGrid(): void;

  /**
   * Get neighbors of a position
   */
  public abstract getNeighbors(position: Position): Position[];

  /**
   * Calculate distance between two positions
   */
  public abstract getDistance(from: Position, to: Position): number;

  /**
   * Check if a position is valid (within bounds)
   */
  public abstract isValidPosition(position: Position): boolean;

  /**
   * Convert position to a unique key for the map
   */
  protected positionToKey(position: Position): string {
    return `${position.q},${position.r}`;
  }

  /**
   * Get cell at position
   */
  public getCell(position: Position): GridCell | undefined {
    return this.cells.get(this.positionToKey(position));
  }

  /**
   * Set cell at position
   */
  public setCell(position: Position, cell: GridCell): void {
    this.cells.set(this.positionToKey(position), cell);
  }

  /**
   * Check if a cell is walkable (not blocked and not occupied)
   */
  public isWalkable(position: Position): boolean {
    const cell = this.getCell(position);
    if (!cell) return false;
    return cell.type !== CellType.BLOCKED && !cell.occupiedBy;
  }

  /**
   * Get all cells of a specific type
   */
  public getCellsByType(type: CellType): GridCell[] {
    const cells: GridCell[] = [];
    for (const cell of this.cells.values()) {
      if (cell.type === type) {
        cells.push(cell);
      }
    }
    return cells;
  }

  /**
   * Set cell type
   */
  public setCellType(position: Position, type: CellType): void {
    const cell = this.getCell(position);
    if (cell) {
      cell.type = type;
    }
  }

  /**
   * Occupy a cell with a player
   */
  public occupyCell(position: Position, playerId: string): boolean {
    const cell = this.getCell(position);
    if (!cell || cell.occupiedBy) return false;
    cell.occupiedBy = playerId;
    return true;
  }

  /**
   * Free a cell from occupation
   */
  public freeCell(position: Position): void {
    const cell = this.getCell(position);
    if (cell) {
      cell.occupiedBy = undefined;
    }
  }

  /**
   * Get all cells
   */
  public getAllCells(): GridCell[] {
    return Array.from(this.cells.values());
  }

  /**
   * Get grid dimensions
   */
  public getDimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  /**
   * Clear all cell occupations
   */
  public clearOccupations(): void {
    for (const cell of this.cells.values()) {
      cell.occupiedBy = undefined;
    }
  }
}

/**
 * Square grid implementation
 * Uses standard Cartesian coordinates (q, r) = (x, y)
 */
export class SquareGrid extends Grid {
  private allowDiagonal: boolean;

  constructor(width: number, height: number, allowDiagonal: boolean = false) {
    super(width, height);
    this.allowDiagonal = allowDiagonal;
  }

  protected initializeGrid(): void {
    for (let r = 0; r < this.height; r++) {
      for (let q = 0; q < this.width; q++) {
        const position: Position = { q, r };
        const cell: GridCell = {
          position,
          type: CellType.EMPTY,
        };
        this.cells.set(this.positionToKey(position), cell);
      }
    }
  }

  public isValidPosition(position: Position): boolean {
    return (
      position.q >= 0 &&
      position.q < this.width &&
      position.r >= 0 &&
      position.r < this.height
    );
  }

  public getNeighbors(position: Position): Position[] {
    const neighbors: Position[] = [];
    const directions: [number, number][] = [
      [0, -1], // North
      [0, 1],  // South
      [1, 0],  // East
      [-1, 0], // West
    ];

    if (this.allowDiagonal) {
      directions.push(
        [1, -1],  // Northeast
        [-1, -1], // Northwest
        [1, 1],   // Southeast
        [-1, 1]   // Southwest
      );
    }

    for (const [dq, dr] of directions) {
      const neighbor: Position = {
        q: position.q + dq,
        r: position.r + dr,
      };
      if (this.isValidPosition(neighbor)) {
        neighbors.push(neighbor);
      }
    }

    return neighbors;
  }

  public getDistance(from: Position, to: Position): number {
    // Manhattan distance for non-diagonal movement
    // Chebyshev distance for diagonal movement
    const dq = Math.abs(to.q - from.q);
    const dr = Math.abs(to.r - from.r);

    if (this.allowDiagonal) {
      return Math.max(dq, dr); // Chebyshev distance
    } else {
      return dq + dr; // Manhattan distance
    }
  }

  /**
   * Get direction from one position to an adjacent position
   */
  public getDirection(from: Position, to: Position): SquareDirection | null {
    const dq = to.q - from.q;
    const dr = to.r - from.r;

    if (dq === 0 && dr === -1) return SquareDirection.NORTH;
    if (dq === 0 && dr === 1) return SquareDirection.SOUTH;
    if (dq === 1 && dr === 0) return SquareDirection.EAST;
    if (dq === -1 && dr === 0) return SquareDirection.WEST;

    if (this.allowDiagonal) {
      if (dq === 1 && dr === -1) return SquareDirection.NORTHEAST;
      if (dq === -1 && dr === -1) return SquareDirection.NORTHWEST;
      if (dq === 1 && dr === 1) return SquareDirection.SOUTHEAST;
      if (dq === -1 && dr === 1) return SquareDirection.SOUTHWEST;
    }

    return null;
  }

  /**
   * Get position in a specific direction
   */
  public getPositionInDirection(
    from: Position,
    direction: SquareDirection
  ): Position | null {
    const directionMap: Record<SquareDirection, [number, number]> = {
      [SquareDirection.NORTH]: [0, -1],
      [SquareDirection.SOUTH]: [0, 1],
      [SquareDirection.EAST]: [1, 0],
      [SquareDirection.WEST]: [-1, 0],
      [SquareDirection.NORTHEAST]: [1, -1],
      [SquareDirection.NORTHWEST]: [-1, -1],
      [SquareDirection.SOUTHEAST]: [1, 1],
      [SquareDirection.SOUTHWEST]: [-1, 1],
    };

    const [dq, dr] = directionMap[direction];
    if (!this.allowDiagonal && Math.abs(dq) + Math.abs(dr) > 1) {
      return null; // Diagonal movement not allowed
    }

    const newPosition: Position = {
      q: from.q + dq,
      r: from.r + dr,
    };

    return this.isValidPosition(newPosition) ? newPosition : null;
  }
}
