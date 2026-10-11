import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils/cn';

// Admin-written Markdown. Raw HTML, scripts and unsafe links are removed before anything is shown.
export function Markdown({ markdown, className }: { markdown: string; className?: string }) {
  return (
    <div className={cn('prose max-w-none prose-headings:font-medium prose-headings:tracking-tight prose-a:underline-offset-4', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
