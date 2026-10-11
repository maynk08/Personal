import rehypeShiki from '@shikijs/rehype';
import { MarkdownAsync } from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

import { CodeBlock } from '@/components/content/code-block';
import { PROSE_CLASS } from '@/components/content/markdown';
import { cn } from '@/lib/utils/cn';

import type { ShikiTransformer } from 'shiki';

// Marks each highlighted block with its language, for the label above it.
const languageAttribute: ShikiTransformer = {
  name: 'language-attribute',
  pre(node) {
    node.properties['data-language'] = this.options.lang;
  },
};

/**
 * Markdown with highlighted code blocks, rendered on the server so visitors download no highlighter. The content is
 * sanitized first; highlighting then only adds colour to text that is already safe. Colours for both themes are
 * included and `globals.css` picks one from the page's theme. Languages load when a block uses them; unknown ones
 * are shown as plain text.
 */
export async function HighlightedMarkdown({ markdown, className }: { markdown: string; className?: string }) {
  return (
    <div className={cn(PROSE_CLASS, className)}>
      {await MarkdownAsync({
        children: markdown,
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSanitize,
          [
            rehypeShiki,
            {
              themes: { dark: 'github-dark-default', light: 'github-light-default' },
              defaultColor: false,
              defaultLanguage: 'text',
              fallbackLanguage: 'text',
              lazy: true,
              transformers: [languageAttribute],
            },
          ],
        ],
        components: {
          pre: ({ node: _node, ...props }) => <CodeBlock {...props} />,
        },
      })}
    </div>
  );
}
