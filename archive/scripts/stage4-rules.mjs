// OD uses the low + medium pair. Generic PP/KK still needs source confirmation.
export function reviewOD(input) {
  const alternatives = input.split(/\s+or\s+/);
  const explicit = alternatives.map((s) => /^(\d+)((?:[LMH][PK]){2})$/.exec(s));
  if (explicit.every(Boolean)) {
    const selected = explicit.find((m) => m[2] === "LPMP" || m[2] === "LKMK");
    return selected
      ? {
          status: "selected_explicit_pair",
          normalized: selected[1] + (selected[2] === "LPMP" ? "PP" : "KK"),
        }
      : { status: "excluded_button_pair", normalized: null };
  }
  if (/^[\d\[\]]+(PP|KK)$/.test(input))
    return { status: "pending_pair_confirmation", normalized: null };
  return { status: "not_od_or_unsupported", normalized: null };
}

export const cleanSource = (value) =>
  String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/'{2,}/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Comparison preserves composite/conditional strings; equality is not patch verification.
export function compareDisplay(value, source) {
  const display = cleanSource(source);
  if (!display || /\{\{\{/.test(display)) return "source_missing";
  if (value.status === "unknown") return "unknown_preserved";
  if (value.status === "not_applicable")
    return display === "-" ? "equal" : "different";
  if (value.display === "D" && /^(?:H?KD)(?:\s|$)/.test(display))
    return "knockdown_marker_equal";
  return value.display === display ? "equal" : "different_or_conditional";
}
