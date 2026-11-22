// @ts-check
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { compareApi, plainName } from '../parity-api.mjs';

describe('parity:api', () => {
  it('maps T-prefixed Vue names to the plain name', () => {
    assert.equal(plainName('TButton'), 'Button');
    assert.equal(plainName('TDialogTitle'), 'DialogTitle');
    assert.equal(plainName('Table'), 'Table');
    assert.equal(plainName('createToaster'), 'createToaster');
  });

  it('is clean when both frameworks export the same components', () => {
    const r = compareApi(
      ['TButton', 'TTable', 'createToaster'],
      ['Button', 'Table', 'createToaster'],
    );
    assert.deepEqual([r.onlyInVue, r.onlyInReact, r.unprefixedInVue], [[], [], []]);
    assert.equal(r.shared.length, 3);
  });

  it('reports a component missing from either framework', () => {
    const r = compareApi(['TButton', 'TSelect'], ['Button', 'Slider']);
    assert.deepEqual(r.onlyInVue, ['Select']);
    assert.deepEqual(r.onlyInReact, ['Slider']);
  });

  it('flags a Vue component without the T prefix', () => {
    const r = compareApi(['Button'], ['Button']);
    assert.deepEqual(r.unprefixedInVue, ['Button']);
  });

  it('accepts a listed asymmetry', () => {
    const r = compareApi(['TButton'], ['Button', 'Extra'], { vue: {}, react: { Extra: 'why' } });
    assert.deepEqual(r.onlyInReact, []);
  });
});
