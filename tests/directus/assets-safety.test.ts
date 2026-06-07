import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isTokenSafe,
  isSafePublicUrl,
  assertNoTokenLeakage,
  resolveAssetUrl,
} from '../../src/lib/directus/assets';
import { createDirectusFile } from '../fixtures/directus-factories';

describe('Asset URL token safety', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  describe('isTokenSafe', () => {
    it('returns true for URL without tokens', () => {
      console.log('[TEST:assets] isTokenSafe: clean URL');
      expect(isTokenSafe('https://cdn.example.com/assets/abc-123')).toBe(true);
    });

    it('returns false for URL with access_token query param', () => {
      console.log('[TEST:assets] isTokenSafe: access_token detected');
      expect(isTokenSafe('https://cdn.example.com/assets/abc?access_token=secret123')).toBe(false);
    });

    it('returns false for URL with token query param', () => {
      console.log('[TEST:assets] isTokenSafe: token detected');
      expect(isTokenSafe('https://cdn.example.com/assets/abc?token=secret456')).toBe(false);
    });

    it('returns false for URL with empty access_token (still suspicious)', () => {
      console.log('[TEST:assets] isTokenSafe: empty access_token is suspicious');
      expect(isTokenSafe('https://cdn.example.com/assets/abc?access_token=')).toBe(false);
    });
  });

  describe('isSafePublicUrl', () => {
    it('returns true for https URLs', () => {
      console.log('[TEST:assets] isSafePublicUrl: https is safe');
      expect(isSafePublicUrl('https://cdn.example.com/image.jpg')).toBe(true);
    });

    it('returns false for javascript: URLs', () => {
      console.log('[TEST:assets] isSafePublicUrl: javascript: rejected');
      expect(isSafePublicUrl('javascript:alert(1)')).toBe(false);
    });

    it('returns false for data: URLs', () => {
      console.log('[TEST:assets] isSafePublicUrl: data: rejected');
      expect(isSafePublicUrl('data:text/html,<h1>hi</h1>')).toBe(false);
    });

    it('rejects dangerous protocols case-insensitively', () => {
      console.log('[TEST:assets] isSafePublicUrl: case-insensitive');
      expect(isSafePublicUrl('JavaScript:void(0)')).toBe(false);
      expect(isSafePublicUrl('DATA:text/plain,x')).toBe(false);
      expect(isSafePublicUrl('VBScript:MsgBox')).toBe(false);
    });
  });

  describe('assertNoTokenLeakage', () => {
    it('does not throw for array of safe URLs', () => {
      console.log('[TEST:assets] assertNoTokenLeakage: safe URLs pass');
      expect(() =>
        assertNoTokenLeakage([
          { url: 'https://cdn.example.com/assets/abc', field: 'featured_image' },
          { url: 'https://cdn.example.com/assets/def', field: 'og_image', slug: 'my-post' },
        ])
      ).not.toThrow();
    });

    it('throws for URL with token and error message does not contain the URL or token', () => {
      console.log('[TEST:assets] assertNoTokenLeakage: token leak throws safely');
      const secretToken = 'super_secret_tok3n_value';
      const unsafeUrl = `https://cms.example.com/assets/xyz?access_token=${secretToken}`;

      let caught: Error | undefined;
      try {
        assertNoTokenLeakage([{ url: unsafeUrl, field: 'featured_image', slug: 'leaked-post' }]);
      } catch (err) {
        caught = err as Error;
      }

      expect(caught).toBeDefined();
      expect(caught!.message).toContain('Token leak detected');
      expect(caught!.message).toContain('featured_image');
      expect(caught!.message).not.toContain(unsafeUrl);
      expect(caught!.message).not.toContain(secretToken);
    });
  });

  describe('resolveAssetUrl', () => {
    it('produces /assets/{id} URL from Directus file', () => {
      console.log('[TEST:assets] resolveAssetUrl: file resolution');
      vi.stubEnv('DIRECTUS_ASSET_BASE_URL', '');
      vi.stubEnv('DIRECTUS_URL', 'https://cms.example.com');
      const file = createDirectusFile({ id: 'file-uuid-123' });

      const result = resolveAssetUrl(file, null, 'Test alt');

      expect(result).not.toBeNull();
      expect(result!.url).toBe('https://cms.example.com/assets/file-uuid-123');
      expect(result!.alt).toBe('Test alt');
      expect(result!.source).toBe('directus-file');
      expect(result!.width).toBe(1200);
      expect(result!.height).toBe(630);
    });

    it('prefers Directus file over external URL when both provided', () => {
      console.log('[TEST:assets] resolveAssetUrl: file takes priority');
      vi.stubEnv('DIRECTUS_ASSET_BASE_URL', '');
      vi.stubEnv('DIRECTUS_URL', 'https://cms.example.com');
      const file = createDirectusFile({ id: 'preferred-file' });
      const externalUrl = 'https://external.example.com/image.jpg';

      const result = resolveAssetUrl(file, externalUrl);

      expect(result).not.toBeNull();
      expect(result!.url).toContain('preferred-file');
      expect(result!.source).toBe('directus-file');
    });
  });
});
