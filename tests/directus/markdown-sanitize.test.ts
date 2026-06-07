import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '../../src/lib/directus/markdown';

describe('Markdown sanitization schema', () => {
  describe('dangerous content stripped', () => {
    it('strips script tags entirely', async () => {
      console.log('[TEST:markdown] strip: script tags');
      const { html } = await renderMarkdown("<script>alert('xss')</script>");
      expect(html).not.toContain('<script');
      expect(html).not.toContain('alert');
    });

    it('strips style tags entirely', async () => {
      console.log('[TEST:markdown] strip: style tags');
      const { html } = await renderMarkdown('<style>body{display:none}</style>');
      expect(html).not.toContain('<style');
      expect(html).not.toContain('display:none');
    });

    it('strips event handler attributes from allowed tags', async () => {
      console.log('[TEST:markdown] strip: onerror attribute');
      const { html } = await renderMarkdown(
        "![alt](x \"title\")\n\n<img onerror='alert(1)' src='x'>"
      );
      expect(html).not.toContain('onerror');
    });

    it('strips javascript: protocol from links', async () => {
      console.log('[TEST:markdown] strip: javascript: protocol');
      const { html } = await renderMarkdown('[click](javascript:void(0))');
      expect(html).not.toContain('javascript:');
    });

    it('strips onclick attributes', async () => {
      console.log('[TEST:markdown] strip: onclick');
      const { html } = await renderMarkdown("<div onclick='steal()'>text</div>");
      expect(html).not.toContain('onclick');
    });

    it('strips data: protocol from image src', async () => {
      console.log('[TEST:markdown] strip: data: src');
      const { html } = await renderMarkdown("<img src='data:text/html,<h1>evil</h1>'>");
      expect(html).not.toContain('data:');
    });
  });

  describe('legitimate content preserved', () => {
    it('preserves className on code elements', async () => {
      console.log('[TEST:markdown] preserve: code className');
      const { html } = await renderMarkdown('```typescript\nlet x = 1;\n```');
      expect(html).toContain('<code');
      expect(html).toContain('<pre');
    });

    it('preserves id on headings (rehype-slug)', async () => {
      console.log('[TEST:markdown] preserve: heading id');
      const { html } = await renderMarkdown('## My Heading');
      expect(html).toContain('id=');
      expect(html).toContain('my-heading');
    });

    it('preserves href and target on links', async () => {
      console.log('[TEST:markdown] preserve: link attributes');
      const { html } = await renderMarkdown('[Link](https://example.com)');
      expect(html).toContain('href="https://example.com"');
    });

    it('preserves GFM tables', async () => {
      console.log('[TEST:markdown] preserve: GFM tables');
      const { html } = await renderMarkdown('| A | B |\n| --- | --- |\n| 1 | 2 |');
      expect(html).toContain('<table');
      expect(html).toContain('<td');
    });

    it('preserves GFM task lists', async () => {
      console.log('[TEST:markdown] preserve: task lists');
      const { html } = await renderMarkdown('- [x] Done\n- [ ] Todo');
      expect(html).toContain('<input');
      expect(html).toContain('checked');
    });
  });

  describe('edge cases', () => {
    it('strips script from mixed content while keeping safe text', async () => {
      console.log('[TEST:markdown] edge: mixed safe and unsafe');
      const { html } = await renderMarkdown('Safe text\n\n<script>bad</script>\n\nMore safe');
      expect(html).not.toContain('<script');
      expect(html).not.toContain('bad');
      expect(html).toContain('Safe text');
      expect(html).toContain('More safe');
    });

    it('strips nested script tags', async () => {
      console.log('[TEST:markdown] edge: nested scripts');
      const { html } = await renderMarkdown('<div><script><script>double</script></script></div>');
      expect(html).not.toContain('<script');
      expect(html).not.toContain('double');
    });
  });

  describe('heading extraction', () => {
    it('extracts h2-h4 headings with slug and text', async () => {
      console.log('[TEST:markdown] headings: extraction');
      const { headings } = await renderMarkdown(
        '# Title\n\n## Section One\n\n### Subsection\n\n#### Detail\n\n##### Ignored'
      );
      expect(headings).toHaveLength(3);
      expect(headings[0]).toEqual({ depth: 2, slug: 'section-one', text: 'Section One' });
      expect(headings[1]).toEqual({ depth: 3, slug: 'subsection', text: 'Subsection' });
      expect(headings[2]).toEqual({ depth: 4, slug: 'detail', text: 'Detail' });
    });

    it('returns empty headings array for content without headings', async () => {
      console.log('[TEST:markdown] headings: empty');
      const { headings } = await renderMarkdown('Just a paragraph.');
      expect(headings).toEqual([]);
    });
  });
});
