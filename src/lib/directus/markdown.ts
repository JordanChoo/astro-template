import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import type { Root, Element } from 'hast';

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

const sanitizationSchema: Parameters<typeof rehypeSanitize>[0] & object = {
  strip: ['script', 'style'],
  tagNames: [
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'strong',
    'em',
    'blockquote',
    'pre',
    'code',
    'hr',
    'br',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'img',
    'a',
    'figure',
    'figcaption',
    'del',
    'ins',
    'details',
    'summary',
    'input',
    'span',
  ],
  attributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
    code: ['className'],
    span: ['className'],
    input: ['type', 'checked', 'disabled'],
    '*': ['id'],
  },
  protocols: {
    href: ['http', 'https', 'mailto', 'tel'],
    src: ['http', 'https'],
  },
};

function extractHeadings(tree: Root): Heading[] {
  const headings: Heading[] = [];

  function visit(node: Root | Element) {
    if (node.type === 'element' && /^h[2-4]$/.test(node.tagName)) {
      const depth = parseInt(node.tagName.charAt(1)!, 10);
      const slug = (node.properties?.id as string | undefined) ?? '';
      const text = getTextContent(node);
      if (text) {
        headings.push({ depth, slug, text });
      }
    }

    if ('children' in node) {
      for (const child of node.children) {
        if (child.type === 'element') {
          visit(child);
        }
      }
    }
  }

  visit(tree);
  return headings;
}

function getTextContent(node: Element): string {
  let text = '';
  for (const child of node.children) {
    if (child.type === 'text') {
      text += child.value;
    } else if (child.type === 'element') {
      text += getTextContent(child);
    }
  }
  return text;
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeSanitize, sanitizationSchema)
  .use(rehypeSlug)
  .use(rehypeStringify);

export async function renderMarkdown(
  content: string
): Promise<{ html: string; headings: Heading[] }> {
  const mdast = processor.parse(content);
  const hast = await processor.run(mdast);
  const headings = extractHeadings(hast as Root);
  const html = processor.stringify(hast as Parameters<typeof processor.stringify>[0]);

  return {
    html: String(html),
    headings,
  };
}
