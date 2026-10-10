// Navigation reads like paths: the "About me" heading becomes "~/about-me".
export function toPathLabel(heading: string): string {
  const slug = heading
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `~/${slug}`;
}
