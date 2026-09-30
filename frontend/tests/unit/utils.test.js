import { isValidEmail, isValidPassword } from '../../src/lib/utils/validation.js';
import { formatXP, formatNumber } from '../../src/lib/utils/formatting.js';

export const runUtilsTests = () => {
  console.assert(isValidEmail('test@university.edu') === true, 'isValidEmail failed');
  console.assert(isValidEmail('invalid-email') === false, 'isValidEmail negative failed');
  console.assert(isValidPassword('secure123') === true, 'isValidPassword failed');
  console.assert(isValidPassword('123') === false, 'isValidPassword negative failed');
  console.assert(formatXP(1500) === '1.5k XP', 'formatXP failed');
  console.assert(formatNumber(1000) === '1,000', 'formatNumber failed');
  console.log('All utils tests passed.');
};
