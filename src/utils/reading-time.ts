/**
 * Reading Time Calculator
 *
 * Calculates estimated reading time for blog posts based on word count.
 * Strips MDX/code blocks from the content before counting words.
 *
 * @module utils/reading-time
 */

/** Average reading speed in words per minute */
const WORDS_PER_MINUTE = 238;

/**
 * Strips MDX-specific syntax and code blocks from content
 *
 * Removes:
 * - Code blocks (```...```)
 * - Inline code (`...`)
 * - Import/export statements
 * - JSX component tags
 * - HTML comments
 *
 * @param content - Raw MDX/Markdown content
 * @returns Cleaned content with only prose text
 */
function stripMdxAndCodeBlocks(content: string): string {
  let cleaned = content;

  // Remove fenced code blocks (```...```)
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');

  // Remove inline code (`...`)
  cleaned = cleaned.replace(/`[^`]+`/g, '');

  // Remove import statements
  cleaned = cleaned.replace(/^import\s+.*$/gm, '');

  // Remove export statements
  cleaned = cleaned.replace(/^export\s+.*$/gm, '');

  // Remove JSX/HTML tags (including self-closing)
  cleaned = cleaned.replace(/<[^>]+>/g, '');

  // Remove HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  // Remove frontmatter if present (---...---)
  cleaned = cleaned.replace(/^---[\s\S]*?---/m, '');

  return cleaned;
}

/**
 * Counts the number of words in a string
 *
 * Splits on whitespace and filters out empty strings.
 *
 * @param text - Text to count words in
 * @returns Number of words
 */
function countWords(text: string): number {
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  return words.length;
}

/**
 * Calculates the estimated reading time for content
 *
 * Uses 238 words per minute as the average reading speed.
 * Strips MDX/code blocks before counting to focus on prose.
 * Returns minimum of 1 minute, rounded up.
 *
 * @param content - Raw MDX/Markdown content to analyze
 * @returns Estimated reading time in minutes (minimum 1)
 *
 * @example
 * ```typescript
 * const readingTime = calculateReadingTime(post.body);
 * console.log(`${readingTime} min read`); // "5 min read"
 * ```
 */
export function calculateReadingTime(content: string): number {
  const cleanedContent = stripMdxAndCodeBlocks(content);
  const wordCount = countWords(cleanedContent);
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);

  // Ensure minimum of 1 minute
  return Math.max(1, minutes);
}
