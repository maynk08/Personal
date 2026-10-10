// The monospace label that opens each section: "03 // projects". The slashes are decoration.
export function SectionLabel({ index, name }: { index: number; name: string }) {
  return (
    <p className="font-mono text-xs text-accent">
      {String(index).padStart(2, '0')}{' '}
      <span aria-hidden="true" className="text-decor">
        {'//'}
      </span>{' '}
      <span className="text-muted">{name.toLowerCase()}</span>
    </p>
  );
}
