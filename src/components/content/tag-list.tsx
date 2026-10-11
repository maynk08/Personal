// Short monospace chips, for tech stacks and details.
export function TagList({ tags, label }: { tags: string[]; label: string }) {
  if (tags.length === 0) {
    return null;
  }
  return (
    <ul aria-label={label} className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li key={tag} className="rounded-md border border-border px-2 py-0.5 font-mono text-xs text-muted">
          {tag}
        </li>
      ))}
    </ul>
  );
}
