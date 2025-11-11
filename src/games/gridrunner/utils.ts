/**
 * GridRunner Game Utilities
 *
 * Pathfinding, validation, and helper functions for the grid game
 */

import { Grid } from './Grid';
import { Position, MovementCard, MovementCardSpecial } from './types';

/**
 * Find a path from start to end using A* algorithm
 */
export function findPath(
  grid: Grid,
  start: Position,
  end: Position,
  maxDistance: number,
  canJump: boolean = false
): Position[] | null {
  if (!grid.isValidPosition(start) || !grid.isValidPosition(end)) {
    return null;
  }

  // If start and end are the same
  if (positionsEqual(start, end)) {
    return [start];
  }

  // Priority queue for A* (using simple array, can be optimized with heap)
  interface Node {
    position: Position;
    gCost: number; // Cost from start to this node
    hCost: number; // Heuristic cost from this node to end
    fCost: number; // Total cost (g + h)
    parent: Node | null;
  }

  const openList: Node[] = [];
  const closedSet = new Set<string>();

  const startNode: Node = {
    position: start,
    gCost: 0,
    hCost: grid.getDistance(start, end),
    fCost: 0,
    parent: null,
  };
  startNode.fCost = startNode.gCost + startNode.hCost;
  openList.push(startNode);

  const posToKey = (pos: Position) => `${pos.q},${pos.r}`;

  while (openList.length > 0) {
    // Get node with lowest fCost
    openList.sort((a, b) => a.fCost - b.fCost);
    const current = openList.shift()!;

    // Check if we reached the end
    if (positionsEqual(current.position, end)) {
      return reconstructPath(current);
    }

    closedSet.add(posToKey(current.position));

    // Check distance limit
    if (current.gCost >= maxDistance) {
      continue;
    }

    // Explore neighbors
    const neighbors = grid.getNeighbors(current.position);

    for (const neighborPos of neighbors) {
      const neighborKey = posToKey(neighborPos);

      if (closedSet.has(neighborKey)) {
        continue;
      }

      // Check if walkable (or can jump)
      if (!canJump && !grid.isWalkable(neighborPos)) {
        continue;
      }

      const gCost = current.gCost + 1;
      const hCost = grid.getDistance(neighborPos, end);
      const fCost = gCost + hCost;

      // Check if this neighbor is already in open list
      const existingNode = openList.find((node) =>
        positionsEqual(node.position, neighborPos)
      );

      if (existingNode) {
        // If we found a better path, update it
        if (gCost < existingNode.gCost) {
          existingNode.gCost = gCost;
          existingNode.fCost = fCost;
          existingNode.parent = current;
        }
      } else {
        // Add new node to open list
        openList.push({
          position: neighborPos,
          gCost,
          hCost,
          fCost,
          parent: current,
        });
      }
    }
  }

  // No path found
  return null;
}

/**
 * Reconstruct path from A* node
 */
function reconstructPath(node: {
  position: Position;
  parent: { position: Position; parent: any } | null;
}): Position[] {
  const path: Position[] = [];
  let current: typeof node | null = node;

  while (current !== null) {
    path.unshift(current.position);
    current = current.parent;
  }

  return path;
}

/**
 * Check if two positions are equal
 */
export function positionsEqual(pos1: Position, pos2: Position): boolean {
  return pos1.q === pos2.q && pos1.r === pos2.r;
}

/**
 * Get all reachable positions from a start position within a distance
 */
export function getReachablePositions(
  grid: Grid,
  start: Position,
  maxDistance: number,
  canJump: boolean = false
): Position[] {
  const reachable: Position[] = [];
  const visited = new Set<string>();

  interface QueueNode {
    position: Position;
    distance: number;
  }

  const queue: QueueNode[] = [{ position: start, distance: 0 }];
  const posToKey = (pos: Position) => `${pos.q},${pos.r}`;

  visited.add(posToKey(start));

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.distance > 0) {
      reachable.push(current.position);
    }

    if (current.distance >= maxDistance) {
      continue;
    }

    const neighbors = grid.getNeighbors(current.position);

    for (const neighbor of neighbors) {
      const key = posToKey(neighbor);

      if (visited.has(key)) {
        continue;
      }

      if (!canJump && !grid.isWalkable(neighbor)) {
        continue;
      }

      visited.add(key);
      queue.push({
        position: neighbor,
        distance: current.distance + 1,
      });
    }
  }

  return reachable;
}

/**
 * Validate if a move is valid based on the card and game state
 */
export function isValidMove(
  grid: Grid,
  from: Position,
  to: Position,
  card: MovementCard
): boolean {
  // Check if positions are valid
  if (!grid.isValidPosition(from) || !grid.isValidPosition(to)) {
    return false;
  }

  // Check if destination is walkable
  if (!grid.isWalkable(to)) {
    return false;
  }

  // Calculate distance
  const distance = grid.getDistance(from, to);

  // Check if distance is within card's range
  if (distance > card.distance) {
    return false;
  }

  // Handle special card abilities
  if (card.special === MovementCardSpecial.TELEPORT) {
    // Teleport can go to any valid position within range
    return distance <= card.distance;
  }

  if (card.special === MovementCardSpecial.JUMP) {
    // Jump cards can move over blocked cells
    const path = findPath(grid, from, to, card.distance, true);
    return path !== null;
  }

  // For normal movement, check if there's a valid path
  const path = findPath(grid, from, to, card.distance, false);
  return path !== null;
}

/**
 * Calculate the score for reaching a position
 * Used for goal cells and checkpoints
 */
export function calculatePositionScore(
  grid: Grid,
  position: Position
): number {
  const cell = grid.getCell(position);
  if (!cell) return 0;

  // Score based on cell type
  switch (cell.type) {
    case 'GOAL':
      return 100;
    case 'CHECKPOINT':
      return 25;
    default:
      return 0;
  }
}

/**
 * Get the shortest distance between any two sets of positions
 * Useful for finding closest goal or checkpoint
 */
export function getClosestPosition(
  grid: Grid,
  from: Position,
  targets: Position[]
): { position: Position; distance: number } | null {
  if (targets.length === 0) return null;

  let closest: Position | null = null;
  let minDistance = Infinity;

  for (const target of targets) {
    const distance = grid.getDistance(from, target);
    if (distance < minDistance) {
      minDistance = distance;
      closest = target;
    }
  }

  return closest ? { position: closest, distance: minDistance } : null;
}

/**
 * Generate a random valid position on the grid
 */
export function getRandomPosition(
  grid: Grid,
  mustBeWalkable: boolean = true
): Position | null {
  const allCells = grid.getAllCells();
  const validCells = mustBeWalkable
    ? allCells.filter((cell) => grid.isWalkable(cell.position))
    : allCells;

  if (validCells.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * validCells.length);
  return validCells[randomIndex].position;
}

/**
 * Clone a position (to avoid reference issues)
 */
export function clonePosition(position: Position): Position {
  return { q: position.q, r: position.r };
}
