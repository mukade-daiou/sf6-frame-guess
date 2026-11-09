export const decisionKey = (d) => `${d.moveId}/${d.field}`;
export const candidateKey = (d) =>
  `${d.characterId}/${d.sourceIndex}/${d.field}`;
export function isContactRevoked(policy, d) {
  return (
    policy.distanceRanges?.contactTimingRollback?.revoked.some(
      (x) => decisionKey(x) === decisionKey(d),
    ) ?? false
  );
}
export function expectedDistanceValue(policy, d) {
  return isContactRevoked(policy, d) ? d.before : d.value;
}
export function rollbackClassification(policy, key, fallback) {
  return policy.distanceRanges?.contactTimingRollback?.candidates.some(
    (x) => x.key === key,
  )
    ? "excluded"
    : fallback;
}
