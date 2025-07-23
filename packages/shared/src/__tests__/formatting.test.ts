import {
  formatCurrency,
  formatFileSize,
  truncateText,
  capitalizeFirstLetter,
} from '../utils/formatting';

describe('Formatting Utilities', () => {
  test('formatCurrency', () => {
    expect(formatCurrency(123.45)).toBe('$123.45');
    expect(formatCurrency(1000)).toBe('$1,000.00');
  });

  test('formatFileSize', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1048576)).toBe('1 MB');
  });

  test('truncateText', () => {
    expect(truncateText('Hello World', 5)).toBe('He...');
    expect(truncateText('Short', 10)).toBe('Short');
  });

  test('capitalizeFirstLetter', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello');
    expect(capitalizeFirstLetter('WORLD')).toBe('World');
  });
});
