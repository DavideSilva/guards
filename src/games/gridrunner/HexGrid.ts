/**
 * Hexagonal Grid System
 *
 * Implements hexagonal grid using axial coordinates
 * Reference: https://www.redblobgames.com/grids/hexagons/
 */

import { Position, GridCell, CellType, HexDirection } from './types';
import { Grid } from './Grid';

/**
 * Hexagonal grid implementation using axial coordinates
 * Uses "pointy-top" hexagon orientation
 *
 * Axial coordinates (q, r):
 * - q increases towards the right
 * - r increases towards the bottom-right
 */
export class HexGrid extends Grid {
  constructor(width: number, height: number) {
    super(width, height);
  }

  protected initializeGrid(): void {
    // Initialize hexagonal grid in axial coordinates
    // For a rectangular shape in hex coordinates
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

  /**
   * Get the six neighbors of a hexagonal cell
   * Using axial coordinates
   */
  public getNeighbors(position: Position): Position[] {
    const neighbors: Position[] = [];

    // Six directions in axial coordinates (pointy-top orientation)
    const directions: [number, number][] = [
      [1, 0],   // East
      [-1, 0],  // West
      [1, -1],  // Northeast
      [0, -1],  // Northwest
      [0, 1],   // Southeast
      [-1, 1],  // Southwest
    ];

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

  /**
   * Calculate distance between two hex positions
   * Uses cube coordinate conversion for distance calculation
   */
  public getDistance(from: Position, to: Position): number {
    // Convert axial to cube coordinates
    const fromCube = this.axialToCube(from);
    const toCube = this.axialToCube(to);

    // Distance in cube coordinates is:
    // (|x1 - x2| + |y1 - y2| + |z1 - z2|) / 2
    return (
      (Math.abs(fromCube.x - toCube.x) +
        Math.abs(fromCube.y - toCube.y) +
        Math.abs(fromCube.z - toCube.z)) /
      2
    );
  }

  /**
   * Convert axial coordinates to cube coordinates
   * Cube coordinates: x + y + z = 0
   */
  private axialToCube(pos: Position): { x: number; y: number; z: number } {
    const x = pos.q;
    const z = pos.r;
    const y = -x - z;
    return { x, y, z };
  }

  /**
   * Convert cube coordinates to axial coordinates
   */
  private cubeToAxial(cube: {
    x: number;
    y: number;
    z: number;
  }): Position {
    return { q: cube.x, r: cube.z };
  }

  /**
   * Get direction from one position to an adjacent position
   */
  public getDirection(from: Position, to: Position): HexDirection | null {
    const dq = to.q - from.q;
    const dr = to.r - from.r;

    if (dq === 1 && dr === 0) return HexDirection.EAST;
    if (dq === -1 && dr === 0) return HexDirection.WEST;
    if (dq === 1 && dr === -1) return HexDirection.NORTHEAST;
    if (dq === 0 && dr === -1) return HexDirection.NORTHWEST;
    if (dq === 0 && dr === 1) return HexDirection.SOUTHEAST;
    if (dq === -1 && dr === 1) return HexDirection.SOUTHWEST;

    return null;
  }

  /**
   * Get position in a specific direction
   */
  public getPositionInDirection(
    from: Position,
    direction: HexDirection
  ): Position | null {
    const directionMap: Record<HexDirection, [number, number]> = {
      [HexDirection.EAST]: [1, 0],
      [HexDirection.WEST]: [-1, 0],
      [HexDirection.NORTHEAST]: [1, -1],
      [HexDirection.NORTHWEST]: [0, -1],
      [HexDirection.SOUTHEAST]: [0, 1],
      [HexDirection.SOUTHWEST]: [-1, 1],
    };

    const [dq, dr] = directionMap[direction];
    const newPosition: Position = {
      q: from.q + dq,
      r: from.r + dr,
    };

    return this.isValidPosition(newPosition) ? newPosition : null;
  }

  /**
   * Get a line of positions from start to end
   * Useful for pathfinding and movement visualization
   */
  public getLine(from: Position, to: Position): Position[] {
    const distance = this.getDistance(from, to);
    const line: Position[] = [];

    if (distance === 0) {
      return [from];
    }

    const fromCube = this.axialToCube(from);
    const toCube = this.axialToCube(to);

    for (let i = 0; i <= distance; i++) {
      const t = i / distance;
      const cube = {
        x: fromCube.x + (toCube.x - fromCube.x) * t,
        y: fromCube.y + (toCube.y - fromCube.y) * t,
        z: fromCube.z + (toCube.z - fromCube.z) * t,
      };
      line.push(this.cubeToAxial(this.roundCube(cube)));
    }

    return line;
  }

  /**
   * Round cube coordinates to nearest valid cube coordinate
   */
  private roundCube(cube: {
    x: number;
    y: number;
    z: number;
  }): { x: number; y: number; z: number } {
    let rx = Math.round(cube.x);
    let ry = Math.round(cube.y);
    let rz = Math.round(cube.z);

    const xDiff = Math.abs(rx - cube.x);
    const yDiff = Math.abs(ry - cube.y);
    const zDiff = Math.abs(rz - cube.z);

    if (xDiff > yDiff && xDiff > zDiff) {
      rx = -ry - rz;
    } else if (yDiff > zDiff) {
      ry = -rx - rz;
    } else {
      rz = -rx - ry;
    }

    return { x: rx, y: ry, z: rz };
  }

  /**
   * Get all positions within a certain range
   * Useful for area of effect abilities
   */
  public getRange(center: Position, range: number): Position[] {
    const positions: Position[] = [];
    const centerCube = this.axialToCube(center);

    for (let x = -range; x <= range; x++) {
      for (let y = Math.max(-range, -x - range); y <= Math.min(range, -x + range); y++) {
        const z = -x - y;
        const cube = {
          x: centerCube.x + x,
          y: centerCube.y + y,
          z: centerCube.z + z,
        };
        const pos = this.cubeToAxial(cube);
        if (this.isValidPosition(pos)) {
          positions.push(pos);
        }
      }
    }

    return positions;
  }
}
