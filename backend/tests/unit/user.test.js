import test from 'node:test';
import assert from 'node:assert';
import { validateUser } from '../../src/validators/user.validator.js';

test('validateUser allows valid user data', () => {
  const error = validateUser({ full_name: 'Alex Rivera' });
  assert.strictEqual(error, null);
});
