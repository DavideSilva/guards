import { useState } from 'react';
import { BlackjackGame, Player, BlackjackAction, formatHandScore } from 'guards-card-game';
import { BlackjackCard } from 'guards-card-game';
import { Card as CardComponent } from './components/Card';

type GamePhase = 'setup' | 'playing' | 'roundEnd';

function App() {
  const [game, setGame] = useState<BlackjackGame | null>(null);
  const [player, setPlayer] = useState<Player<BlackjackCard> | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  const [, forceUpdate] = useState({});

  // Stats
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [pushes, setPushes] = useState(0);
  const [blackjacks, setBlackjacks] = useState(0);

  const startGame = () => {
    if (!playerName.trim()) return;

    const newGame = new BlackjackGame({
      numDecks: 6,
      dealerStandsOnSoft17: true,
      blackjackPayout: 1.5
    });

    const newPlayer = new Player<BlackjackCard>('player1', playerName.trim());
    newGame.addPlayer(newPlayer);
    newGame.start();

    setGame(newGame);
    setPlayer(newPlayer);
    setGamePhase('playing');
  };

  const handleHit = () => {
    if (!game || !player) return;

    game.hit(player.id);
    forceUpdate({});

    const score = game.getPlayerScore(player.id);
    if (score.isBust) {
      endRound();
    }
  };

  const handleStand = () => {
    if (!game || !player) return;

    game.stand(player.id);
    forceUpdate({});
    endRound();
  };

  const handleDouble = () => {
    if (!game || !player) return;

    game.double(player.id);
    forceUpdate({});
    endRound();
  };

  const endRound = () => {
    setGamePhase('roundEnd');

    // Update stats
    setTimeout(() => {
      if (game && player) {
        const result = game.getLastResult(player.id);

        if (result === 'WIN') {
          setWins(w => w + 1);
        } else if (result === 'LOSE') {
          setLosses(l => l + 1);
        } else if (result === 'PUSH') {
          setPushes(p => p + 1);
        } else if (result === 'BLACKJACK') {
          setBlackjacks(b => b + 1);
          setWins(w => w + 1);
        }
      }
    }, 100);
  };

  const newRound = () => {
    if (!game) return;

    game.newRound();
    setGamePhase('playing');
    forceUpdate({});
  };

  const resetGame = () => {
    setGame(null);
    setPlayer(null);
    setGamePhase('setup');
    setPlayerName('');
    setWins(0);
    setLosses(0);
    setPushes(0);
    setBlackjacks(0);
  };

  if (gamePhase === 'setup') {
    return (
      <div className="app">
        <div className="header">
          <h1>♠️ Blackjack ♥️</h1>
          <p>Beat the dealer. Get as close to 21 as you can!</p>
        </div>

        <div className="game-setup">
          <h2>Welcome to Blackjack</h2>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && startGame()}
            autoFocus
          />
          <button
            className="btn btn-primary"
            onClick={startGame}
            disabled={!playerName.trim()}
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  if (!game || !player) return null;

  const playerScore = game.getPlayerScore(player.id);
  const dealerScore = game.getDealerScore();
  const availableActions = game.getAvailableActions(player.id);
  const isDealerRevealed = game.isDealerRevealed;
  const lastResult = gamePhase === 'roundEnd' ? game.getLastResult(player.id) : null;

  return (
    <div className="app">
      <div className="header">
        <h1>♠️ Blackjack ♥️</h1>
        <p>Round {game.round}</p>
      </div>

      {/* Dealer Area */}
      <div className="dealer-area">
        <div className="area-header">
          <h2>🎩 Dealer</h2>
          {isDealerRevealed && (
            <div className={`score-display ${dealerScore.isBust ? 'bust' : dealerScore.isBlackjack ? 'blackjack' : ''}`}>
              {formatHandScore(dealerScore)}
            </div>
          )}
        </div>

        <div className="cards-container">
          {game.dealerPlayer.hand.allCards.map((card, index) => (
            <CardComponent
              key={card.id}
              card={card}
              hidden={!isDealerRevealed && index === 1}
            />
          ))}
        </div>
      </div>

      {/* Result Message */}
      {lastResult && (
        <div className={`result-message ${lastResult.toLowerCase()}`}>
          {lastResult === 'BLACKJACK' && '🎉 BLACKJACK! 🎉'}
          {lastResult === 'WIN' && '🎊 You Win! 🎊'}
          {lastResult === 'LOSE' && '😔 You Lose'}
          {lastResult === 'PUSH' && '🤝 Push (Tie)'}
        </div>
      )}

      {/* Player Area */}
      <div className="player-area">
        <div className="area-header">
          <h2>🎮 {player.name}</h2>
          <div className={`score-display ${playerScore.isBust ? 'bust' : playerScore.isBlackjack ? 'blackjack' : ''}`}>
            {formatHandScore(playerScore)}
          </div>
        </div>

        <div className="cards-container">
          {player.hand.allCards.map((card) => (
            <CardComponent key={card.id} card={card} />
          ))}
        </div>

        {/* Controls */}
        <div className="controls">
          {gamePhase === 'playing' && availableActions.length > 0 && (
            <>
              {availableActions.includes(BlackjackAction.HIT) && (
                <button className="btn btn-primary" onClick={handleHit}>
                  Hit
                </button>
              )}
              {availableActions.includes(BlackjackAction.STAND) && (
                <button className="btn btn-secondary" onClick={handleStand}>
                  Stand
                </button>
              )}
              {availableActions.includes(BlackjackAction.DOUBLE) && (
                <button className="btn btn-secondary" onClick={handleDouble}>
                  Double Down
                </button>
              )}
            </>
          )}

          {gamePhase === 'roundEnd' && (
            <>
              <button className="btn btn-primary" onClick={newRound}>
                New Round
              </button>
              <button className="btn btn-danger" onClick={resetGame}>
                Quit Game
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat-item">
          <div className="stat-label">Wins</div>
          <div className="stat-value">{wins}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Losses</div>
          <div className="stat-value">{losses}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Pushes</div>
          <div className="stat-value">{pushes}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Blackjacks</div>
          <div className="stat-value">{blackjacks}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Score</div>
          <div className="stat-value">{player.score}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
