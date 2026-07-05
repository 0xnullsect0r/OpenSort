/** Renders `stars` filled stars out of 3 as a single text node (e.g. "★★☆"). */
export function renderStars(stars: number): string {
  const filled = Math.max(0, Math.min(3, stars));
  return '★'.repeat(filled) + '☆'.repeat(3 - filled);
}
