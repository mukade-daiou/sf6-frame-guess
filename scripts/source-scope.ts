// User scope decisions, applied to source notation before any OD normalization.
export function excludedInputReason(input: string): string | null {
  if (/PPP|KKK/.test(input))
    return "User scope: three-button inputs are excluded.";
  if (/^6\[6\]$/.test(input)) return "User scope: buttonless Run is excluded.";
  if (/^(?:(?:[1-9](?:\/[1-9])?)?(?:PP|KK)|2KK or 3KK)$/.test(input))
    return "User scope: non-OD simultaneous two-button special inputs are excluded; never reinterpret as OD.";
  return null;
}
