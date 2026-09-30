import test from 'node:test';
import assert from 'node:assert';
import app from '../../src/index.js';

test('App initializes and exports Express application instance', () => {
  assert.ok(typeof app === 'function');
});
