import { describe, it, expect } from 'vitest';
import { backoffSeconds } from '@/server/outbox/backoff';

const noJitter = { random: () => 0.5 }; // multiplier = exactly 1

describe('outbox backoff (ADR-010)', () => {
  it('grows exponentially from the base', () => {
    expect(backoffSeconds(1, noJitter)).toBe(30);
    expect(backoffSeconds(2, noJitter)).toBe(60);
    expect(backoffSeconds(3, noJitter)).toBe(120);
    expect(backoffSeconds(6, noJitter)).toBe(960);
  });

  it('caps at maxSeconds', () => {
    expect(backoffSeconds(8, noJitter)).toBe(3600);
    expect(backoffSeconds(50, noJitter)).toBe(3600);
  });

  it('keeps jitter within ±20 % of the raw delay', () => {
    expect(backoffSeconds(2, { random: () => 0 })).toBe(48); // 60 · 0.8
    expect(backoffSeconds(2, { random: () => 1 })).toBe(72); // 60 · 1.2
    for (let i = 0; i < 50; i += 1) {
      const value = backoffSeconds(2);
      expect(value).toBeGreaterThanOrEqual(48);
      expect(value).toBeLessThanOrEqual(72);
    }
  });

  it('never returns below one second', () => {
    expect(
      backoffSeconds(1, { baseSeconds: 0, random: () => 0 }),
    ).toBeGreaterThanOrEqual(1);
  });
});
