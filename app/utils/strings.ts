export function pluralize(
  singular: string,
  plural: string,
  count: number | undefined
) {
  if (count === 1) {
    return singular;
  }
  return plural;
}
