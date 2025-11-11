import { Card as CardType } from 'guards-card-game';
import { BlackjackCard } from 'guards-card-game';

interface CardProps {
  card: CardType<BlackjackCard>;
  hidden?: boolean;
}

const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

const SUIT_COLORS = {
  hearts: 'red',
  diamonds: 'red',
  clubs: 'black',
  spades: 'black'
};

export function Card({ card, hidden = false }: CardProps) {
  if (hidden) {
    return (
      <div className="card card-back">
        <div style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffd700',
          fontSize: '2rem'
        }}>
          ?
        </div>
      </div>
    );
  }

  const suit = card.getProperty('suit');
  const rank = card.getProperty('rank');
  const color = SUIT_COLORS[suit];
  const symbol = SUIT_SYMBOLS[suit];

  return (
    <div className={`card ${color}`}>
      <div className="card-rank">{rank}</div>
      <div className="card-suit">{symbol}</div>
      <div className="card-rank" style={{ transform: 'rotate(180deg)' }}>{rank}</div>
    </div>
  );
}
