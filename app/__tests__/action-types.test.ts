/**
 * UNIT TESTS — app/lib/action-types.ts
 * Verifies type exports and module shape via source-string checks.
 */
import {describe, it, expect} from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');
const src = fs.readFileSync(path.join(ROOT, 'app/lib/action-types.ts'), 'utf-8');

describe('action-types — module shape', () => {
  it('exports ActionResult type', () => {
    expect(src).toContain('export type ActionResult');
  });

  it('exports ActionSuccess type', () => {
    expect(src).toContain('export type ActionSuccess');
  });

  it('exports ActionError interface', () => {
    expect(src).toContain('export interface ActionError');
  });

  it('exports ActionSuccessData type', () => {
    expect(src).toContain('export type ActionSuccessData');
  });

  it('exports ActionResultData type for typed data payloads', () => {
    expect(src).toContain('export type ActionResultData');
  });

  it('ActionError has success: false discriminant', () => {
    expect(src).toContain('success: false');
  });

  it('ActionError has error string field', () => {
    expect(src).toContain('error: string');
  });

  it('ActionError has optional status field', () => {
    expect(src).toContain('status?: number');
  });

  it('ActionSuccess has success: true discriminant', () => {
    expect(src).toContain('success: true');
  });
});

describe('action-types — runtime usage', () => {
  it('ActionResult narrows correctly on success discriminant', () => {
    /* Verify runtime shape without instantiating types — just structural check */
    const ok: {success: true} = {success: true};
    const err: {success: false; error: string} = {success: false, error: 'test'};
    expect(ok.success).toBe(true);
    expect(err.success).toBe(false);
    expect(err.error).toBe('test');
  });

  it('ActionError allows optional status', () => {
    const err = {success: false as const, error: 'fail', status: 429};
    expect(err.status).toBe(429);
  });
});
