import { isValidEmail, isValidUrl, isValidUUID } from '../utils/validation';

describe('Validation Utilities', () => {
  test('isValidEmail', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('bademail')).toBe(false);
  });

  test('isValidUrl', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('not a url')).toBe(false);
  });

  test('isValidUUID', () => {
    expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    expect(isValidUUID('not-a-uuid')).toBe(false);
  });
});
