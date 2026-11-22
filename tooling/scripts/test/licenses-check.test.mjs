// @ts-check
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isAllowed, normalizeLicense } from '../licenses-check.mjs';

describe('licenses:check', () => {
  it('allows permissive licenses and rejects the rest', () => {
    assert.equal(isAllowed('MIT'), true);
    assert.equal(isAllowed('Apache-2.0'), true);
    assert.equal(isAllowed('GPL-3.0'), false);
    assert.equal(isAllowed('UNKNOWN'), false);
  });

  it('reads SPDX expressions: OR needs one allowed, AND needs all', () => {
    assert.equal(isAllowed('(MIT OR GPL-3.0)'), true);
    assert.equal(isAllowed('(GPL-3.0 OR AGPL-3.0)'), false);
    assert.equal(isAllowed('(MIT AND ISC)'), true);
    assert.equal(isAllowed('(MIT AND GPL-3.0)'), false);
  });

  it('normalizes the license field shapes', () => {
    assert.equal(normalizeLicense('MIT'), 'MIT');
    assert.equal(normalizeLicense({ type: 'ISC' }), 'ISC');
    assert.equal(normalizeLicense(undefined), 'UNKNOWN');
  });
});
