// Launch roster follows the official character page; additions follow release order.
const characterOrder = [
  "luke",
  "jamie",
  "manon",
  "kimberly",
  "marisa",
  "lily",
  "jp",
  "juri",
  "dee_jay",
  "cammy",
  "ryu",
  "e_honda",
  "blanka",
  "guile",
  "ken",
  "chunli",
  "zangief",
  "dhalsim",
  "rashid",
  "aki",
  "ed",
  "akuma",
  "m_bison",
  "terry",
  "mai",
  "elena",
  "sagat",
  "cviper",
  "alex",
  "ingrid",
  "yasmine",
  "arjun",
];
const rank = new Map(characterOrder.map((id, index) => [id, index]));

export function sortCharactersForDisplay<T extends { id: string }>(
  characters: readonly T[],
): T[] {
  return [...characters].sort(
    (a, b) => (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity),
  );
}
