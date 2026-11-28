import { defaultTheme } from '@tessen-ui/theme';
import type { Theme } from '@tessen-ui/theme';
import { describe, expect, it } from 'vitest';
import {
  COALESCE_MS,
  HISTORY_LIMIT,
  canRedo,
  canUndo,
  commit,
  createHistory,
  current,
  jump,
  redo,
  undo,
} from '../src/history';

const withRadius = (radius: number): Theme => ({ ...defaultTheme(), radius });

describe('history', () => {
  it('starts with one entry and nothing to undo or redo', () => {
    const h = createHistory(defaultTheme(), 'Inicio', 0);
    expect(canUndo(h)).toBe(false);
    expect(canRedo(h)).toBe(false);
  });

  it('commit, undo and redo walk the entries', () => {
    let h = createHistory(defaultTheme(), 'Inicio', 0);
    h = commit(h, withRadius(8), 'Radio', 10_000);
    h = commit(h, { ...withRadius(8), density: 'compact' }, 'Densidad', 20_000);
    expect(current(h).density).toBe('compact');
    h = undo(h);
    expect(current(h).density).toBe('default');
    h = undo(h);
    expect(current(h).radius).toBe(9);
    expect(canUndo(h)).toBe(false);
    h = redo(h);
    expect(current(h).radius).toBe(8);
  });

  it('ignores a commit that changes nothing', () => {
    const h = createHistory(defaultTheme(), 'Inicio', 0);
    expect(commit(h, defaultTheme(), 'Nada', 1)).toBe(h);
  });

  it('merges quick edits with the same label (a slider drag) into one step', () => {
    let h = createHistory(defaultTheme(), 'Inicio', 0);
    h = commit(h, withRadius(7), 'Radio', 10_000);
    h = commit(h, withRadius(8), 'Radio', 10_000 + COALESCE_MS - 1);
    h = commit(h, withRadius(9), 'Radio', 10_000 + COALESCE_MS + 100);
    expect(h.entries).toHaveLength(2);
    expect(current(h).radius).toBe(9);
    h = commit(h, withRadius(10), 'Radio', 10_000 + COALESCE_MS + 100 + COALESCE_MS + 1);
    expect(h.entries).toHaveLength(3);
    h = undo(h);
    expect(current(h).radius).toBe(9);
    h = undo(h);
    expect(h.cursor).toBe(0);
  });

  it('does not merge different labels or slow edits', () => {
    let h = createHistory(defaultTheme(), 'Inicio', 0);
    h = commit(h, withRadius(7), 'Radio', 10_000);
    h = commit(h, { ...withRadius(7), density: 'compact' }, 'Densidad', 10_100);
    expect(h.entries).toHaveLength(3);
  });

  it('a new edit after undo drops the redo branch', () => {
    let h = createHistory(defaultTheme(), 'Inicio', 0);
    h = commit(h, withRadius(8), 'Radio', 10_000);
    h = undo(h);
    h = commit(h, withRadius(2), 'Radio', 20_000);
    expect(canRedo(h)).toBe(false);
    expect(current(h).radius).toBe(2);
  });

  it('jump goes to any entry and ignores bad indexes', () => {
    let h = createHistory(defaultTheme(), 'Inicio', 0);
    h = commit(h, withRadius(8), 'A', 10_000);
    h = commit(h, withRadius(9), 'B', 20_000);
    expect(jump(h, 0).cursor).toBe(0);
    expect(jump(h, 99)).toBe(h);
  });

  it('keeps at most HISTORY_LIMIT entries', () => {
    let h = createHistory(defaultTheme(), 'Inicio', 0);
    for (let i = 1; i <= HISTORY_LIMIT + 20; i++) {
      h = commit(h, withRadius((i % 20) + 0.5 + i / 1000), `E${i}`, i * 10_000);
    }
    expect(h.entries).toHaveLength(HISTORY_LIMIT);
    expect(h.cursor).toBe(HISTORY_LIMIT - 1);
  });
});
