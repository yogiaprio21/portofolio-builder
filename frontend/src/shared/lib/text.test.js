import { describe, it, expect } from 'vitest';
import {
  resolveText,
  resolveTextStrict,
  resolveArray,
  resolveArrayStrict,
  hasText,
  renderDuration,
} from './text';

describe('text utils', () => {
  it('resolveText handles strings and objects', () => {
    expect(resolveText('abc', 'id')).toBe('abc');
    expect(resolveText({ id: 'hai', en: 'hi' }, 'id')).toBe('hai');
    expect(resolveText({ en: 'hi' }, 'id')).toBe('hi');
    expect(resolveText(null, 'id')).toBe('');
  });

  it('resolveArray handles arrays and objects', () => {
    expect(resolveArray(['a', 'b'], 'id')).toEqual(['a', 'b']);
    expect(resolveArray({ id: ['a'] }, 'id')).toEqual(['a']);
    expect(resolveArray({ en: ['x'] }, 'id')).toEqual(['x']);
    expect(resolveArray(undefined, 'id')).toEqual([]);
  });

  it('strict resolvers do not fallback across languages', () => {
    expect(resolveTextStrict({ id: 'hai' }, 'en')).toBe('');
    expect(resolveTextStrict('hai', 'en')).toBe('');
    expect(resolveTextStrict('hai', 'id')).toBe('hai');
    expect(resolveArrayStrict({ id: ['a'] }, 'en')).toEqual([]);
    expect(resolveArrayStrict(['a'], 'en')).toEqual([]);
    expect(resolveArrayStrict(['a'], 'id')).toEqual(['a']);
  });

  it('hasText detects presence in string/object/array', () => {
    expect(hasText('a')).toBe(true);
    expect(hasText('  ')).toBe(false);
    expect(hasText(['', 'x'])).toBe(true);
    expect(hasText({ id: '  ', en: 'b' })).toBe(true);
    expect(hasText({ id: [''], en: ['c'] })).toBe(true);
  });

  it('renderDuration formats ranges', () => {
    expect(renderDuration('2020', '2022')).toBe('2020 - 2022');
    expect(renderDuration('2020', '')).toBe('2020');
    expect(renderDuration('', '2022')).toBe('2022');
    expect(renderDuration('', '')).toBe('');
  });
});
