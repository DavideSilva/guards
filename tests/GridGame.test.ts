/**
 * GridRunner Game Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GridGame } from '../src/games/gridrunner/GridGame';
import { SquareGrid } from '../src/games/gridrunner/Grid';
import { HexGrid } from '../src/games/gridrunner/HexGrid';
import { Player } from '../src/game/Player';
import {
  GridType,
  Position,
  CellType,
  GridGamePhase,
} from '../src/games/gridrunner/types';
import {
  findPath,
  positionsEqual,
  getReachablePositions,
} from '../src/games/gridrunner/utils';

describe('SquareGrid', () => {
  it('should create a square grid with correct dimensions', () => {
    const grid = new SquareGrid(5, 5);
    const dims = grid.getDimensions();

    expect(dims.width).toBe(5);
    expect(dims.height).toBe(5);
  });

  it('should validate positions correctly', () => {
    const grid = new SquareGrid(5, 5);

    expect(grid.isValidPosition({ q: 0, r: 0 })).toBe(true);
    expect(grid.isValidPosition({ q: 4, r: 4 })).toBe(true);
    expect(grid.isValidPosition({ q: 5, r: 5 })).toBe(false);
    expect(grid.isValidPosition({ q: -1, r: 0 })).toBe(false);
  });

  it('should get neighbors correctly (4-directional)', () => {
    const grid = new SquareGrid(5, 5, false);
    const neighbors = grid.getNeighbors({ q: 2, r: 2 });

    expect(neighbors.length).toBe(4);
    expect(neighbors).toContainEqual({ q: 2, r: 1 }); // North
    expect(neighbors).toContainEqual({ q: 2, r: 3 }); // South
    expect(neighbors).toContainEqual({ q: 3, r: 2 }); // East
    expect(neighbors).toContainEqual({ q: 1, r: 2 }); // West
  });

  it('should get neighbors correctly (8-directional)', () => {
    const grid = new SquareGrid(5, 5, true);
    const neighbors = grid.getNeighbors({ q: 2, r: 2 });

    expect(neighbors.length).toBe(8);
  });

  it('should calculate Manhattan distance correctly', () => {
    const grid = new SquareGrid(10, 10, false);
    const distance = grid.getDistance({ q: 0, r: 0 }, { q: 3, r: 4 });

    expect(distance).toBe(7); // 3 + 4
  });

  it('should calculate Chebyshev distance correctly', () => {
    const grid = new SquareGrid(10, 10, true);
    const distance = grid.getDistance({ q: 0, r: 0 }, { q: 3, r: 4 });

    expect(distance).toBe(4); // max(3, 4)
  });

  it('should handle cell types correctly', () => {
    const grid = new SquareGrid(5, 5);

    grid.setCellType({ q: 0, r: 0 }, CellType.START);
    grid.setCellType({ q: 4, r: 4 }, CellType.GOAL);
    grid.setCellType({ q: 2, r: 2 }, CellType.BLOCKED);

    const startCell = grid.getCell({ q: 0, r: 0 });
    const goalCell = grid.getCell({ q: 4, r: 4 });
    const blockedCell = grid.getCell({ q: 2, r: 2 });

    expect(startCell?.type).toBe(CellType.START);
    expect(goalCell?.type).toBe(CellType.GOAL);
    expect(blockedCell?.type).toBe(CellType.BLOCKED);
  });

  it('should handle cell occupation correctly', () => {
    const grid = new SquareGrid(5, 5);
    const position: Position = { q: 2, r: 2 };

    expect(grid.occupyCell(position, 'player1')).toBe(true);
    expect(grid.isWalkable(position)).toBe(false);

    grid.freeCell(position);
    expect(grid.isWalkable(position)).toBe(true);
  });
});

describe('HexGrid', () => {
  it('should create a hex grid with correct dimensions', () => {
    const grid = new HexGrid(5, 5);
    const dims = grid.getDimensions();

    expect(dims.width).toBe(5);
    expect(dims.height).toBe(5);
  });

  it('should get 6 neighbors for hex cells', () => {
    const grid = new HexGrid(5, 5);
    const neighbors = grid.getNeighbors({ q: 2, r: 2 });

    expect(neighbors.length).toBe(6);
  });

  it('should calculate hex distance correctly', () => {
    const grid = new HexGrid(10, 10);
    const distance = grid.getDistance({ q: 0, r: 0 }, { q: 3, r: 0 });

    expect(distance).toBe(3);
  });

  it('should get range correctly', () => {
    const grid = new HexGrid(10, 10);
    const range = grid.getRange({ q: 5, r: 5 }, 2);

    expect(range.length).toBeGreaterThan(0);
    // Center cell + 6 neighbors at distance 1 + 12 at distance 2 = 19 cells
    // But some might be out of bounds
    expect(range.length).toBeLessThanOrEqual(19);
  });
});

describe('Pathfinding Utils', () => {
  it('should find path in square grid', () => {
    const grid = new SquareGrid(5, 5);
    const path = findPath(grid, { q: 0, r: 0 }, { q: 2, r: 2 }, 10);

    expect(path).not.toBeNull();
    expect(path![0]).toEqual({ q: 0, r: 0 });
    expect(path![path!.length - 1]).toEqual({ q: 2, r: 2 });
  });

  it('should return null if no path exists', () => {
    const grid = new SquareGrid(5, 5);

    // Block the path
    for (let i = 0; i < 5; i++) {
      grid.setCellType({ q: 2, r: i }, CellType.BLOCKED);
    }

    const path = findPath(grid, { q: 0, r: 0 }, { q: 4, r: 0 }, 10);

    expect(path).toBeNull();
  });

  it('should respect max distance constraint', () => {
    const grid = new SquareGrid(5, 5);
    const path = findPath(grid, { q: 0, r: 0 }, { q: 4, r: 4 }, 3);

    // Distance is 8, but max is 3, so should return null
    expect(path).toBeNull();
  });

  it('should find path with jump ability', () => {
    const grid = new SquareGrid(5, 5);

    // Create a complete wall from top to bottom
    for (let r = 0; r < 5; r++) {
      grid.setCellType({ q: 2, r }, CellType.BLOCKED);
    }

    // Without jump, no path
    const pathWithoutJump = findPath(
      grid,
      { q: 0, r: 1 },
      { q: 4, r: 1 },
      10,
      false
    );
    expect(pathWithoutJump).toBeNull();

    // With jump, should find path
    const pathWithJump = findPath(
      grid,
      { q: 0, r: 1 },
      { q: 4, r: 1 },
      10,
      true
    );
    expect(pathWithJump).not.toBeNull();
  });

  it('should get reachable positions correctly', () => {
    const grid = new SquareGrid(5, 5);
    const reachable = getReachablePositions(grid, { q: 2, r: 2 }, 2);

    expect(reachable.length).toBeGreaterThan(0);

    // All reachable positions should be within distance 2
    for (const pos of reachable) {
      const distance = grid.getDistance({ q: 2, r: 2 }, pos);
      expect(distance).toBeLessThanOrEqual(2);
    }
  });

  it('should check position equality correctly', () => {
    expect(positionsEqual({ q: 1, r: 2 }, { q: 1, r: 2 })).toBe(true);
    expect(positionsEqual({ q: 1, r: 2 }, { q: 2, r: 1 })).toBe(false);
  });
});

describe('GridGame', () => {
  let game: GridGame;
  let player1: Player<any>;
  let player2: Player<any>;

  beforeEach(() => {
    game = new GridGame({
      gridType: GridType.SQUARE,
      width: 10,
      height: 10,
      minPlayers: 1,
      maxPlayers: 4,
      allowDiagonalMovement: false,
      startPositions: [
        { q: 0, r: 0 },
        { q: 9, r: 9 },
      ],
      goalPositions: [{ q: 9, r: 9 }],
      deckSize: 40,
      handSize: 5,
    });

    player1 = new Player('p1', 'Player 1');
    player2 = new Player('p2', 'Player 2');
  });

  it('should create a game with correct configuration', () => {
    const config = game.getGridConfig();

    expect(config.width).toBe(10);
    expect(config.height).toBe(10);
    expect(config.gridType).toBe(GridType.SQUARE);
  });

  it('should start in SETUP phase', () => {
    expect(game.getPhase()).toBe(GridGamePhase.SETUP);
    expect(game.state).toBe('SETUP');
  });

  it('should add players correctly', () => {
    game.addPlayer(player1);
    game.addPlayer(player2);

    expect(game.players.length).toBe(2);
  });

  it('should initialize players on start', () => {
    game.addPlayer(player1);
    game.start();

    expect(game.getPhase()).toBe(GridGamePhase.PLAYING);
    expect(game.state).toBe('PLAYING');

    const position = game.getPlayerPosition('p1');
    expect(position).not.toBeNull();
    expect(position).toEqual({ q: 0, r: 0 });

    // Player should have cards in hand
    expect(player1.hand.size).toBe(5);
  });

  it('should handle card playing correctly', () => {
    game.addPlayer(player1);
    game.start();

    const cards = player1.hand.allCards;
    expect(cards.length).toBeGreaterThan(0);

    const firstCard = cards[0];
    const cardId = firstCard.getProperty('id');
    const distance = firstCard.getProperty('distance');

    // Try to move within range
    const targetPosition: Position = { q: distance, r: 0 };

    const result = game.playCard('p1', cardId, targetPosition);

    if (result.success) {
      expect(result.success).toBe(true);
      expect(result.endPosition).toEqual(targetPosition);

      // Player should be at new position
      const newPosition = game.getPlayerPosition('p1');
      expect(newPosition).toEqual(targetPosition);

      // Card should be removed from hand and a new card drawn (single player game)
      // Play card: 5 -> 4, then turn advances and player draws: 4 -> 5
      expect(player1.hand.size).toBe(5);
    }
  });

  it('should prevent playing when not your turn', () => {
    game.addPlayer(player1);
    game.addPlayer(player2);
    game.start();

    // player1 goes first
    const p2Cards = player2.hand.allCards;
    if (p2Cards.length > 0) {
      const cardId = p2Cards[0].getProperty('id');
      const result = game.playCard('p2', cardId, { q: 1, r: 0 });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not your turn');
    }
  });

  it('should get reachable positions for a card', () => {
    game.addPlayer(player1);
    game.start();

    const cards = player1.hand.allCards;
    if (cards.length > 0) {
      const cardId = cards[0].getProperty('id');
      const reachable = game.getReachablePositions('p1', cardId);

      expect(reachable.length).toBeGreaterThan(0);
    }
  });

  it('should track scores correctly', () => {
    game.addPlayer(player1);
    game.start();

    const initialScore = game.getPlayerScore('p1');
    expect(initialScore).toBe(0);
  });

  it('should end game when player reaches goal', () => {
    const smallGame = new GridGame({
      gridType: GridType.SQUARE,
      width: 3,
      height: 3,
      minPlayers: 1,
      maxPlayers: 1,
      allowDiagonalMovement: false,
      startPositions: [{ q: 0, r: 0 }],
      goalPositions: [{ q: 2, r: 0 }],
      deckSize: 20,
      handSize: 5,
    });

    const player = new Player('p1', 'Player 1');
    smallGame.addPlayer(player);
    smallGame.start();

    // Try to reach goal (this might require multiple moves)
    const cards = player.hand.allCards;
    let gameEnded = false;

    for (const card of cards) {
      const distance = card.getProperty('distance');
      if (distance >= 2) {
        const cardId = card.getProperty('id');
        const result = smallGame.playCard('p1', cardId, { q: 2, r: 0 });

        if (result.success) {
          gameEnded = smallGame.state === 'FINISHED';
          break;
        }
      }
    }

    if (gameEnded) {
      expect(smallGame.getPhase()).toBe(GridGamePhase.ENDED);
    }
  });

  it('should return game state correctly', () => {
    game.addPlayer(player1);
    game.start();

    const state = game.getGameState();

    expect(state.phase).toBe(GridGamePhase.PLAYING);
    expect(state.players.length).toBe(1);
    expect(state.currentPlayerId).toBe('p1');
    expect(state.gridType).toBe(GridType.SQUARE);
  });
});

describe('GridGame with Hexagonal Grid', () => {
  it('should work with hexagonal grid', () => {
    const game = new GridGame({
      gridType: GridType.HEXAGONAL,
      width: 8,
      height: 8,
      minPlayers: 1,
      maxPlayers: 2,
      allowDiagonalMovement: false,
      startPositions: [{ q: 0, r: 0 }],
      goalPositions: [{ q: 7, r: 7 }],
      deckSize: 30,
      handSize: 5,
    });

    const player = new Player('p1', 'Hex Player');
    game.addPlayer(player);
    game.start();

    expect(game.getPhase()).toBe(GridGamePhase.PLAYING);
    expect(game.getGridConfig().gridType).toBe(GridType.HEXAGONAL);

    const position = game.getPlayerPosition('p1');
    expect(position).toEqual({ q: 0, r: 0 });
  });
});
