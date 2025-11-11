/**
 * Terminal Display for GridRunner Game
 *
 * Utilities for rendering the grid and game state in the terminal
 */

import { GridGame } from './GridGame';
import { Grid } from './Grid';
import { Position, CellType, GridType, MovementCard } from './types';
import { Card } from '../../core/Card';

/**
 * ANSI color codes for terminal output
 */
const COLORS = {
  RESET: '\x1b[0m',
  BRIGHT: '\x1b[1m',
  DIM: '\x1b[2m',

  // Foreground colors
  BLACK: '\x1b[30m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[37m',

  // Background colors
  BG_BLACK: '\x1b[40m',
  BG_RED: '\x1b[41m',
  BG_GREEN: '\x1b[42m',
  BG_YELLOW: '\x1b[43m',
  BG_BLUE: '\x1b[44m',
  BG_MAGENTA: '\x1b[45m',
  BG_CYAN: '\x1b[46m',
  BG_WHITE: '\x1b[47m',
};

/**
 * Display the game grid
 */
export function displayGrid(
  game: GridGame,
  highlightPositions?: Position[]
): void {
  const grid = game.getGrid();
  const gameState = game.getGameState();
  const { width, height } = grid.getDimensions();

  console.log('\n' + COLORS.BRIGHT + '=== Grid ===' + COLORS.RESET + '\n');

  // Create a map of player positions for quick lookup
  const playerPositions = new Map<string, string>();
  for (const player of gameState.players) {
    const key = `${player.position.q},${player.position.r}`;
    playerPositions.set(key, player.id);
  }

  // Create a set of highlighted positions
  const highlightSet = new Set<string>();
  if (highlightPositions) {
    for (const pos of highlightPositions) {
      highlightSet.add(`${pos.q},${pos.r}`);
    }
  }

  if (gameState.gridType === GridType.SQUARE) {
    displaySquareGrid(grid, playerPositions, highlightSet, width, height);
  } else {
    displayHexGrid(grid, playerPositions, highlightSet, width, height);
  }

  console.log('');
}

/**
 * Display square grid
 */
function displaySquareGrid(
  grid: Grid,
  playerPositions: Map<string, string>,
  highlightSet: Set<string>,
  width: number,
  height: number
): void {
  // Top border
  console.log('  ┌' + '─'.repeat(width * 2 + 1) + '┐');

  for (let r = 0; r < height; r++) {
    let row = `${r.toString().padStart(2)} │ `;

    for (let q = 0; q < width; q++) {
      const position: Position = { q, r };
      const cell = grid.getCell(position);
      const key = `${q},${r}`;

      if (!cell) {
        row += '  ';
        continue;
      }

      let symbol = ' ';
      let color = COLORS.RESET;

      // Check if player is on this cell
      const playerId = playerPositions.get(key);
      if (playerId) {
        // Show player number (1-4)
        const playerIndex =
          Array.from(playerPositions.values()).indexOf(playerId) + 1;
        symbol = playerIndex.toString();
        color = COLORS.BRIGHT + COLORS.CYAN;
      } else {
        // Show cell type
        switch (cell.type) {
          case CellType.START:
            symbol = 'S';
            color = COLORS.GREEN;
            break;
          case CellType.GOAL:
            symbol = 'G';
            color = COLORS.BRIGHT + COLORS.YELLOW;
            break;
          case CellType.CHECKPOINT:
            symbol = 'C';
            color = COLORS.MAGENTA;
            break;
          case CellType.BLOCKED:
            symbol = '█';
            color = COLORS.DIM;
            break;
          case CellType.EMPTY:
            symbol = '·';
            color = COLORS.DIM;
            break;
        }
      }

      // Highlight if in highlight set
      if (highlightSet.has(key)) {
        color = COLORS.BG_BLUE + COLORS.WHITE;
      }

      row += color + symbol + COLORS.RESET + ' ';
    }

    row += '│';
    console.log(row);
  }

  // Bottom border
  console.log('  └' + '─'.repeat(width * 2 + 1) + '┘');

  // Column numbers
  let colNumbers = '    ';
  for (let q = 0; q < width; q++) {
    colNumbers += q.toString().padStart(2, ' ');
  }
  console.log(colNumbers);
}

/**
 * Display hexagonal grid (simplified representation)
 */
function displayHexGrid(
  grid: Grid,
  playerPositions: Map<string, string>,
  highlightSet: Set<string>,
  width: number,
  height: number
): void {
  // Simplified hex display
  console.log('  (Hexagonal Grid - Simplified View)');
  console.log('');

  for (let r = 0; r < height; r++) {
    // Indent every other row for hex appearance
    let row = r.toString().padStart(2) + ' ';
    if (r % 2 === 1) row += ' ';

    for (let q = 0; q < width; q++) {
      const position: Position = { q, r };
      const cell = grid.getCell(position);
      const key = `${q},${r}`;

      if (!cell) {
        row += '  ';
        continue;
      }

      let symbol = ' ';
      let color = COLORS.RESET;

      const playerId = playerPositions.get(key);
      if (playerId) {
        const playerIndex =
          Array.from(playerPositions.values()).indexOf(playerId) + 1;
        symbol = playerIndex.toString();
        color = COLORS.BRIGHT + COLORS.CYAN;
      } else {
        switch (cell.type) {
          case CellType.START:
            symbol = 'S';
            color = COLORS.GREEN;
            break;
          case CellType.GOAL:
            symbol = 'G';
            color = COLORS.BRIGHT + COLORS.YELLOW;
            break;
          case CellType.CHECKPOINT:
            symbol = 'C';
            color = COLORS.MAGENTA;
            break;
          case CellType.BLOCKED:
            symbol = '█';
            color = COLORS.DIM;
            break;
          case CellType.EMPTY:
            symbol = '·';
            color = COLORS.DIM;
            break;
        }
      }

      if (highlightSet.has(key)) {
        color = COLORS.BG_BLUE + COLORS.WHITE;
      }

      row += color + symbol + COLORS.RESET + ' ';
    }

    console.log(row);
  }
}

/**
 * Display player information
 */
export function displayPlayers(game: GridGame): void {
  const gameState = game.getGameState();

  console.log(
    '\n' + COLORS.BRIGHT + '=== Players ===' + COLORS.RESET + '\n'
  );

  for (let i = 0; i < gameState.players.length; i++) {
    const player = gameState.players[i];
    const isCurrent = player.id === gameState.currentPlayerId;

    const marker = isCurrent
      ? COLORS.BRIGHT + COLORS.CYAN + '► ' + COLORS.RESET
      : '  ';

    console.log(
      `${marker}${COLORS.BRIGHT}Player ${i + 1}${COLORS.RESET}: ${player.name}`
    );
    console.log(
      `   Position: (${player.position.q}, ${player.position.r})`
    );
    console.log(`   Score: ${player.score}`);
    console.log(`   Cards in hand: ${player.handSize}`);
    console.log('');
  }
}

/**
 * Display player's hand
 */
export function displayHand(
  cards: Card<MovementCard>[],
  title: string = 'Your Hand'
): void {
  console.log('\n' + COLORS.BRIGHT + `=== ${title} ===` + COLORS.RESET + '\n');

  if (cards.length === 0) {
    console.log('  (No cards)');
    return;
  }

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const name = card.getProperty('name');
    const description = card.getProperty('description');
    const distance = card.getProperty('distance');
    const special = card.getProperty('special');

    let cardInfo = `  ${i + 1}. ${COLORS.BRIGHT}${name}${COLORS.RESET}`;
    cardInfo += ` ${COLORS.DIM}(Distance: ${distance})${COLORS.RESET}`;

    if (special) {
      cardInfo += ` ${COLORS.YELLOW}[${special}]${COLORS.RESET}`;
    }

    console.log(cardInfo);
    console.log(`     ${COLORS.DIM}${description}${COLORS.RESET}`);
  }

  console.log('');
}

/**
 * Display game header
 */
export function displayHeader(game: GridGame): void {
  const gameState = game.getGameState();

  console.clear();
  console.log(
    '\n' +
      COLORS.BRIGHT +
      COLORS.CYAN +
      '╔════════════════════════════════════════╗' +
      COLORS.RESET
  );
  console.log(
    COLORS.BRIGHT +
      COLORS.CYAN +
      '║           GRID RUNNER GAME             ║' +
      COLORS.RESET
  );
  console.log(
    COLORS.BRIGHT +
      COLORS.CYAN +
      '╚════════════════════════════════════════╝' +
      COLORS.RESET
  );
  console.log('');
  console.log(
    `Grid Type: ${COLORS.BRIGHT}${gameState.gridType}${COLORS.RESET}`
  );
  console.log(
    `Turn: ${COLORS.BRIGHT}${gameState.turnCount}${COLORS.RESET}`
  );
  console.log(
    `Phase: ${COLORS.BRIGHT}${gameState.phase}${COLORS.RESET}`
  );
}

/**
 * Display legend
 */
export function displayLegend(): void {
  console.log('\n' + COLORS.BRIGHT + '=== Legend ===' + COLORS.RESET + '\n');
  console.log(`  ${COLORS.GREEN}S${COLORS.RESET} = Start Position`);
  console.log(
    `  ${COLORS.BRIGHT}${COLORS.YELLOW}G${COLORS.RESET} = Goal Position`
  );
  console.log(`  ${COLORS.MAGENTA}C${COLORS.RESET} = Checkpoint`);
  console.log(`  ${COLORS.DIM}█${COLORS.RESET} = Blocked Cell`);
  console.log(
    `  ${COLORS.BRIGHT}${COLORS.CYAN}1-4${COLORS.RESET} = Player Position`
  );
  console.log(
    `  ${COLORS.BG_BLUE}${COLORS.WHITE}X${COLORS.RESET} = Reachable Position`
  );
  console.log('');
}

/**
 * Display move result
 */
export function displayMoveResult(
  result: {
    success: boolean;
    startPosition: Position;
    endPosition: Position;
    path: Position[];
    message: string;
  }
): void {
  if (result.success) {
    console.log(
      `\n${COLORS.GREEN}✓ ${result.message}${COLORS.RESET}`
    );
    console.log(
      `  Moved from (${result.startPosition.q}, ${result.startPosition.r}) to (${result.endPosition.q}, ${result.endPosition.r})`
    );
    console.log(
      `  Path length: ${result.path.length - 1} cells`
    );
  } else {
    console.log(
      `\n${COLORS.RED}✗ ${result.message}${COLORS.RESET}`
    );
  }
  console.log('');
}

/**
 * Display game over screen
 */
export function displayGameOver(game: GridGame): void {
  const gameState = game.getGameState();

  console.log('\n' + COLORS.BRIGHT + COLORS.YELLOW);
  console.log('╔════════════════════════════════════════╗');
  console.log('║            GAME OVER!                  ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(COLORS.RESET);

  // Sort players by score
  const sortedPlayers = [...gameState.players].sort(
    (a, b) => b.score - a.score
  );

  console.log(COLORS.BRIGHT + '=== Final Scores ===' + COLORS.RESET + '\n');

  for (let i = 0; i < sortedPlayers.length; i++) {
    const player = sortedPlayers[i];
    const medal =
      i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';

    console.log(
      `${medal} ${COLORS.BRIGHT}${player.name}${COLORS.RESET}: ${player.score} points`
    );
  }

  console.log('');
}
