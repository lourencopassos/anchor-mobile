/**
 * Helpers that narrow a runtime value to the exact lowercase i18n sub-key it
 * maps to. Typed i18next rejects `t(`roles.${string}`)` because a widened
 * `string` produces `roles.${string}` (not a known key). Returning a literal
 * union here makes the resulting template literal a valid key union again.
 */
import type { SupporterRole, TemplateType, CommitmentState } from '@api/types';

/** Supporter role → `roles.*` / `roleDescriptions.*` sub-key. */
export function supporterRoleKey(
  role: SupporterRole | string | null | undefined,
): 'verifier' | 'encourager' | 'observer' {
  switch (String(role ?? '').toUpperCase()) {
    case 'VERIFIER':
      return 'verifier';
    case 'ENCOURAGER':
      return 'encourager';
    default:
      return 'observer';
  }
}

/** Template type → `templates.*` sub-key (lowercase literal union). */
export function templateTypeKey(
  template: TemplateType | string | null | undefined,
): Lowercase<TemplateType> {
  return String(template ?? 'custom').toLowerCase() as Lowercase<TemplateType>;
}

/** Commitment state → `state.*` sub-key (lowercase literal union). */
export function commitmentStateKey(
  state: CommitmentState | string | null | undefined,
): Lowercase<CommitmentState> {
  return String(state ?? 'draft').toLowerCase() as Lowercase<CommitmentState>;
}
