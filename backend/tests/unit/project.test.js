import test from 'node:test';
import assert from 'node:assert';
import { validateProject } from '../../src/validators/project.validator.js';

test('validateProject requires a project title', () => {
  const error = validateProject({ title: '' });
  assert.ok(error !== null);
});
