import { useState, useEffect } from 'react';
import {
  GridGame,
  Player,
  GridType,
  GridGamePhase,
  Position,
  Card,
  MovementCard,
  CellType,
} from 'guards-card-game';

function App() {
  const [game, setGame] = useState<GridGame | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [reachablePositions, setReachablePositions] = useState<Position[]>([]);
  const [, forceUpdate] = useState({});

  const startNewGame = (gridType: GridType = GridType.SQUARE) => {
    const newGame = new GridGame({
      gridType,
      width: 10,
      height: 10,
      minPlayers: 1,
      maxPlayers: 1,
      allowDiagonalMovement: false,
      startPositions: [{ q: 0, r: 0 }],
      goalPositions: [{ q: 9, r: 9 }],
      blockedCells: [
        { q: 3, r: 3 },
        { q: 3, r: 4 },
        { q: 3, r: 5 },
        { q: 6, r: 2 },
        { q: 6, r: 3 },
        { q: 6, r: 4 },
      ],
      checkpoints: [
        { q: 5, r: 5 },
        { q: 7, r: 7 },
      ],
      deckSize: 40,
      handSize: 5,
    });

    const player = new Player('player1', 'You');
    newGame.addPlayer(player);
    newGame.start();

    setGame(newGame);
    setSelectedCard(null);
    setReachablePositions([]);
  };

  useEffect(() => {
    startNewGame();
  }, []);

  if (!game) {
    return <div className="app">Loading...</div>;
  }

  const gameState = game.getGameState();
  const grid = game.getGrid();
  const dimensions = grid.getDimensions();
  const currentPlayer = game.players[0];
  const playerPosition = game.getPlayerPosition(currentPlayer.id);

  const handleCardSelect = (card: Card<MovementCard>) => {
    const cardId = card.getProperty('id');
    if (selectedCard === cardId) {
      setSelectedCard(null);
      setReachablePositions([]);
    } else {
      setSelectedCard(cardId);
      const reachable = game.getReachablePositions(currentPlayer.id, cardId);
      setReachablePositions(reachable);
    }
  };

  const handleCellClick = (position: Position) => {
    if (!selectedCard) return;

    // Check if position is reachable
    const isReachable = reachablePositions.some(
      (p) => p.q === position.q && p.r === position.r
    );

    if (!isReachable) return;

    const result = game.playCard(currentPlayer.id, selectedCard, position);

    if (result.success) {
      setSelectedCard(null);
      setReachablePositions([]);
      forceUpdate({});
    } else {
      alert(result.message);
    }
  };

  const getCellClassName = (position: Position): string => {
    const cell = grid.getCell(position);
    if (!cell) return 'grid-cell empty';

    const classes = ['grid-cell'];

    // Check if player is on this cell
    if (
      playerPosition &&
      playerPosition.q === position.q &&
      playerPosition.r === position.r
    ) {
      classes.push('player');
      return classes.join(' ');
    }

    // Check if cell is reachable
    const isReachable = reachablePositions.some(
      (p) => p.q === position.q && p.r === position.r
    );
    if (isReachable) {
      classes.push('reachable');
    }

    // Cell type
    switch (cell.type) {
      case CellType.START:
        classes.push('start');
        break;
      case CellType.GOAL:
        classes.push('goal');
        break;
      case CellType.CHECKPOINT:
        classes.push('checkpoint');
        break;
      case CellType.BLOCKED:
        classes.push('blocked');
        break;
      default:
        classes.push('empty');
    }

    return classes.join(' ');
  };

  const getCellContent = (position: Position): string => {
    const cell = grid.getCell(position);
    if (!cell) return '';

    if (
      playerPosition &&
      playerPosition.q === position.q &&
      playerPosition.r === position.r
    ) {
      return '👤';
    }

    switch (cell.type) {
      case CellType.START:
        return 'S';
      case CellType.GOAL:
        return '🏁';
      case CellType.CHECKPOINT:
        return '⭐';
      case CellType.BLOCKED:
        return '🚫';
      default:
        return '';
    }
  };

  const renderGrid = () => {
    const cells = [];
    for (let r = 0; r < dimensions.height; r++) {
      for (let q = 0; q < dimensions.width; q++) {
        const position: Position = { q, r };
        cells.push(
          <div
            key={`${q},${r}`}
            className={getCellClassName(position)}
            onClick={() => handleCellClick(position)}
          >
            {getCellContent(position)}
          </div>
        );
      }
    }
    return cells;
  };

  if (gameState.phase === GridGamePhase.ENDED) {
    const playerData = gameState.players[0];
    return (
      <div className="app">
        <div className="header">
          <h1>GridRunner</h1>
          <p>Grid-Based Movement Card Game</p>
        </div>
        <div className="game-over">
          <h2>🏁 Game Over!</h2>
          <p style={{ fontSize: '1.5rem', margin: '20px 0' }}>
            Final Score: {playerData.score}
          </p>
          <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
            Congratulations! You reached the goal!
          </p>
          <button
            className="button button-primary"
            onClick={() => startNewGame()}
          >
            Play Again
          </button>
          <button
            className="button button-secondary"
            onClick={() => startNewGame(GridType.HEXAGONAL)}
            style={{ marginTop: '10px' }}
          >
            Try Hexagonal Grid
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <h1>GridRunner</h1>
        <p>Navigate the grid using movement cards to reach the goal!</p>
      </div>

      <div className="game-container">
        <div className="grid-section">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${dimensions.width}, 40px)`,
            }}
          >
            {renderGrid()}
          </div>

          <div className="legend">
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ background: '#27ae60' }}
              ></div>
              <span>Start</span>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ background: '#f39c12' }}
              ></div>
              <span>Goal</span>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ background: '#9b59b6' }}
              ></div>
              <span>Checkpoint</span>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ background: '#2c3e50' }}
              ></div>
              <span>Blocked</span>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ background: '#3498db' }}
              ></div>
              <span>You</span>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ background: 'rgba(46, 204, 113, 0.4)' }}
              ></div>
              <span>Reachable</span>
            </div>
          </div>
        </div>

        <div className="side-panel">
          <div className="panel">
            <h2>Your Stats</h2>
            <div className="player-info">
              <div className="player-stat">
                <span>Score:</span>
                <span>{gameState.players[0].score}</span>
              </div>
              <div className="player-stat">
                <span>Position:</span>
                <span>
                  ({playerPosition?.q}, {playerPosition?.r})
                </span>
              </div>
              <div className="player-stat">
                <span>Turn:</span>
                <span>{gameState.turnCount}</span>
              </div>
            </div>
          </div>

          <div className="panel">
            <h2>Your Hand</h2>
            <div className="hand">
              {currentPlayer.hand.allCards.map((card) => {
                const cardId = card.getProperty('id');
                const name = card.getProperty('name');
                const description = card.getProperty('description');
                const distance = card.getProperty('distance');
                const special = card.getProperty('special');

                return (
                  <div
                    key={cardId}
                    className={`card ${selectedCard === cardId ? 'selected' : ''}`}
                    onClick={() => handleCardSelect(card)}
                  >
                    <div className="card-name">
                      {name} {special && `⚡${special}`}
                    </div>
                    <div className="card-description">{description}</div>
                    <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>
                      Distance: {distance}
                    </div>
                  </div>
                );
              })}
            </div>
            {selectedCard && (
              <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <small>Click a highlighted cell to move there</small>
              </div>
            )}
          </div>

          <div className="panel">
            <h2>Controls</h2>
            <div className="controls">
              <button
                className="button button-primary"
                onClick={() => startNewGame(GridType.SQUARE)}
              >
                New Square Grid
              </button>
              <button
                className="button button-primary"
                onClick={() => startNewGame(GridType.HEXAGONAL)}
              >
                New Hex Grid
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
