import { describe, expect, it } from 'vitest';
import { avatarInitials } from '../src/contracts/avatar.contract.ts';
import { paginationRange } from '../src/contracts/pagination.contract.ts';
import { progressPercent } from '../src/contracts/progress.contract.ts';

const show = (page: number, count: number, siblings?: number) =>
  paginationRange(page, count, siblings).map((i) => (i.type === 'page' ? i.page : '…'));

describe('paginationRange', () => {
  it('lists every page when they fit', () => {
    expect(show(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(show(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(show(1, 0)).toEqual([]);
  });

  it('truncates at the start, in the middle and at the end with a constant length', () => {
    expect(show(1, 20)).toEqual([1, 2, 3, 4, 5, '…', 20]);
    expect(show(10, 20)).toEqual([1, '…', 9, 10, 11, '…', 20]);
    expect(show(20, 20)).toEqual([1, '…', 16, 17, 18, 19, 20]);
    for (const page of [1, 4, 5, 10, 16, 17, 20]) expect(show(page, 20)).toHaveLength(7);
  });

  it('honours siblings and clamps the current page', () => {
    expect(show(10, 30, 2)).toEqual([1, '…', 8, 9, 10, 11, 12, '…', 30]);
    expect(show(99, 20)).toEqual([1, '…', 16, 17, 18, 19, 20]);
    expect(show(-3, 20)).toEqual([1, 2, 3, 4, 5, '…', 20]);
  });
});

describe('avatarInitials', () => {
  it('uses the first and last words, at most two letters', () => {
    expect(avatarInitials('Ada Lovelace')).toBe('AL');
    expect(avatarInitials('  grace   brewster murray hopper ')).toBe('GH');
    expect(avatarInitials('ada')).toBe('A');
    expect(avatarInitials('')).toBe('');
    expect(avatarInitials(undefined)).toBe('');
    expect(avatarInitials('Élodie Ño')).toBe('ÉÑ');
  });
});

describe('progressPercent', () => {
  it('clamps into the scale and treats a missing value as indeterminate', () => {
    expect(progressPercent(undefined, 100)).toBeUndefined();
    expect(progressPercent(Number.NaN, 100)).toBeUndefined();
    expect(progressPercent(40, 100)).toBe(40);
    expect(progressPercent(9, 4)).toBe(100);
    expect(progressPercent(-5, 100)).toBe(0);
    expect(progressPercent(1, 4)).toBe(25);
  });
});
