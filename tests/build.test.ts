import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

describe('Build', () => {
  it('should complete build without errors', () => {
    expect(() => {
      execSync('pnpm run build', {
        cwd: process.cwd(),
        stdio: 'pipe',
        timeout: 120000,
      });
    }).not.toThrow();
  });
});
