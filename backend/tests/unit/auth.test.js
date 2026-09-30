import test from 'node:test';
import assert from 'node:assert';
import { validateAuth } from '../../src/validators/auth.validator.js';

test('validateAuth rejects invalid emails', () => {
  const error = validateAuth({ email: 'bad-email', password: 'password123' });
  assert.ok(error !== null);
});

test('validateAuth accepts valid credentials', () => {
  const error = validateAuth({ email: 'valid@university.edu', password: 'password123' });
  assert.strictEqual(error, null);
});
