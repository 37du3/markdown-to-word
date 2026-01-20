export function stripMathDelimiters(input: string): string {
  if (!input) return '';

  return input
    .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
    .replace(/\$([^\n$]+)\$/g, '$1');
}
