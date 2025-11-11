import { describe, it, expect, beforeEach } from 'vitest';
import { Player } from '../src/game/Player';
import { PlayerStatus } from '../src/game/types';
import { Card } from '../src/core/Card';

interface TestCardProps {
  value: number;
  suit: string;
}

describe('Player', () => {
  let player: Player<TestCardProps>;
  let card1: Card<TestCardProps>;
  let card2: Card<TestCardProps>;
  let card3: Card<TestCardProps>;

  beforeEach(() => {
    player = new Player<TestCardProps>('player1', 'Alice');
    card1 = new Card<TestCardProps>({ value: 1, suit: 'hearts' });
    card2 = new Card<TestCardProps>({ value: 2, suit: 'diamonds' });
    card3 = new Card<TestCardProps>({ value: 3, suit: 'clubs' });
  });

  describe('constructor', () => {
    it('should create a player with id and name', () => {
      expect(player.id).toBe('player1');
      expect(player.name).toBe('Alice');
    });

    it('should start with empty hand', () => {
      expect(player.cardCount).toBe(0);
      expect(player.hasCards).toBe(false);
    });

    it('should start with ACTIVE status', () => {
      expect(player.status).toBe(PlayerStatus.ACTIVE);
      expect(player.isActive).toBe(true);
    });

    it('should start with zero score', () => {
      expect(player.score).toBe(0);
    });

    it('should support max hand size', () => {
      const limitedPlayer = new Player<TestCardProps>('p2', 'Bob', 5);
      expect(limitedPlayer.hand.maxSize).toBe(5);
    });
  });

  describe('name', () => {
    it('should allow changing name', () => {
      player.name = 'Alice Smith';
      expect(player.name).toBe('Alice Smith');
    });
  });

  describe('status', () => {
    it('should allow changing status', () => {
      player.status = PlayerStatus.WAITING;
      expect(player.status).toBe(PlayerStatus.WAITING);
      expect(player.isActive).toBe(false);
    });

    it('should support all status types', () => {
      player.status = PlayerStatus.FOLDED;
      expect(player.isActive).toBe(false);

      player.status = PlayerStatus.DISCONNECTED;
      expect(player.isActive).toBe(false);

      player.status = PlayerStatus.ACTIVE;
      expect(player.isActive).toBe(true);
    });
  });

  describe('score', () => {
    it('should allow setting score', () => {
      player.score = 100;
      expect(player.score).toBe(100);
    });

    it('should increment score', () => {
      player.addScore(10);
      expect(player.score).toBe(10);

      player.addScore(5);
      expect(player.score).toBe(15);
    });

    it('should increment score by 1 by default', () => {
      player.addScore();
      expect(player.score).toBe(1);
    });

    it('should reset score', () => {
      player.score = 50;
      player.resetScore();
      expect(player.score).toBe(0);
    });
  });

  describe('card management', () => {
    it('should add a card', () => {
      player.addCard(card1);

      expect(player.cardCount).toBe(1);
      expect(player.hasCards).toBe(true);
    });

    it('should add multiple cards', () => {
      player.addCards([card1, card2, card3]);

      expect(player.cardCount).toBe(3);
      expect(player.hasCards).toBe(true);
    });

    it('should play a card by index', () => {
      player.addCards([card1, card2, card3]);

      const played = player.playCard(1);

      expect(played).toBe(card2);
      expect(player.cardCount).toBe(2);
    });

    it('should return undefined for invalid card index', () => {
      player.addCard(card1);

      const played = player.playCard(5);

      expect(played).toBeUndefined();
      expect(player.cardCount).toBe(1);
    });

    it('should play a card matching predicate', () => {
      player.addCards([card1, card2, card3]);

      const played = player.playCardWhere(c => c.getProperty('value') === 2);

      expect(played).toBe(card2);
      expect(player.cardCount).toBe(2);
    });

    it('should discard entire hand', () => {
      player.addCards([card1, card2, card3]);

      const discarded = player.discardHand();

      expect(discarded.length).toBe(3);
      expect(player.cardCount).toBe(0);
      expect(player.hasCards).toBe(false);
    });

    it('should sort hand', () => {
      player.addCards([card3, card1, card2]);

      player.sortHand((a, b) => a.getProperty('value') - b.getProperty('value'));

      expect(player.hand.peek(0)?.getProperty('value')).toBe(1);
      expect(player.hand.peek(1)?.getProperty('value')).toBe(2);
      expect(player.hand.peek(2)?.getProperty('value')).toBe(3);
    });
  });

  describe('metadata', () => {
    it('should set and get metadata', () => {
      player.setMetadata('role', 'dealer');

      expect(player.getMetadata('role')).toBe('dealer');
    });

    it('should check if metadata exists', () => {
      player.setMetadata('role', 'dealer');

      expect(player.hasMetadata('role')).toBe(true);
      expect(player.hasMetadata('nonexistent')).toBe(false);
    });

    it('should return undefined for non-existent metadata', () => {
      expect(player.getMetadata('nonexistent')).toBeUndefined();
    });

    it('should store various types of metadata', () => {
      player.setMetadata('number', 42);
      player.setMetadata('boolean', true);
      player.setMetadata('object', { foo: 'bar' });

      expect(player.getMetadata('number')).toBe(42);
      expect(player.getMetadata('boolean')).toBe(true);
      expect(player.getMetadata('object')).toEqual({ foo: 'bar' });
    });

    it('should clear all metadata', () => {
      player.setMetadata('a', 1);
      player.setMetadata('b', 2);

      player.clearMetadata();

      expect(player.hasMetadata('a')).toBe(false);
      expect(player.hasMetadata('b')).toBe(false);
    });
  });

  describe('reset', () => {
    beforeEach(() => {
      player.addCards([card1, card2, card3]);
      player.score = 50;
      player.status = PlayerStatus.FOLDED;
      player.setMetadata('test', 'value');
    });

    it('should reset player state but keep score and metadata', () => {
      player.reset();

      expect(player.cardCount).toBe(0);
      expect(player.status).toBe(PlayerStatus.ACTIVE);
      expect(player.score).toBe(50);
      expect(player.getMetadata('test')).toBe('value');
    });

    it('should fully reset player including score and metadata', () => {
      player.fullReset();

      expect(player.cardCount).toBe(0);
      expect(player.status).toBe(PlayerStatus.ACTIVE);
      expect(player.score).toBe(0);
      expect(player.hasMetadata('test')).toBe(false);
    });
  });

  describe('toString', () => {
    it('should create a string representation', () => {
      player.addCards([card1, card2]);
      player.score = 10;

      const str = player.toString();

      expect(str).toContain('Alice');
      expect(str).toContain('cards: 2');
      expect(str).toContain('score: 10');
      expect(str).toContain('ACTIVE');
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON', () => {
      player.addCards([card1, card2]);
      player.score = 25;
      player.setMetadata('role', 'dealer');

      const json = player.toJSON();

      expect(json).toEqual({
        id: 'player1',
        name: 'Alice',
        cardCount: 2,
        status: PlayerStatus.ACTIVE,
        score: 25,
        metadata: { role: 'dealer' }
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle a typical game round', () => {
      // Deal cards
      player.addCards([card1, card2, card3]);
      expect(player.cardCount).toBe(3);

      // Sort hand
      player.sortHand((a, b) => a.getProperty('value') - b.getProperty('value'));

      // Play some cards
      player.playCard(0);
      player.playCard(0);
      expect(player.cardCount).toBe(1);

      // Add score
      player.addScore(10);
      expect(player.score).toBe(10);

      // End round
      player.discardHand();
      expect(player.cardCount).toBe(0);
    });
  });
});
