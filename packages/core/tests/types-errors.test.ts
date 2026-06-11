import { describe, it, expect } from 'vitest';
import { ApidiffError, LoadError, ParseError, RefError, ConfigError, FormatError } from '../src/types/errors.js';

describe('Errors', () => {
  it('instantiates correctly', () => {
    const parseErr = new ParseError('Test error', 10, 20, 'file.yaml', new Error('cause'));
    expect(parseErr.name).toBe('ParseError');
    expect(parseErr.message).toBe('Test error');
    expect(parseErr.line).toBe(10);
    expect(parseErr.col).toBe(20);
    expect(parseErr.filePath).toBe('file.yaml');

    const refErr = new RefError('Test ref error', '#/test');
    expect(refErr.name).toBe('RefError');
    expect(refErr.message).toBe('Test ref error');
    expect(refErr.ref).toBe('#/test');

    expect(new LoadError('load').name).toBe('LoadError');
    expect(new ConfigError('config').name).toBe('ConfigError');
    expect(new FormatError('format').name).toBe('FormatError');
  });
});
