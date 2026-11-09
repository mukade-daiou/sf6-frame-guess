export function decisionKey(d: { moveId: string; field: string }): string;
export function candidateKey(d: {
  characterId: string;
  sourceIndex: number;
  field: string;
}): string;
export function isContactRevoked(policy: any, d: any): boolean;
export function expectedDistanceValue(policy: any, d: any): any;
export function rollbackClassification(
  policy: any,
  key: string,
  fallback: string,
): string;
