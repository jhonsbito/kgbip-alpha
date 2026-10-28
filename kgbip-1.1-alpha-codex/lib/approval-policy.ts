export type ApprovalReason =
  | "medical_guidance"
  | "scheduling_change"
  | "surgery_or_material"
  | "financial_or_insurance"
  | "low_confidence"
  | "new_contact";

export type ApprovalDecision = {
  requiresApproval: boolean;
  reasons: ApprovalReason[];
};

const sensitivePatterns: Array<[ApprovalReason, RegExp]> = [
  ["medical_guidance", /diagn[oó]stico|resultado|laudo|medica[cç][aã]o|dor|risco|contraindica/i],
  ["surgery_or_material", /cirurgia|pr[oó]tese|material|implante|opme/i],
  ["financial_or_insurance", /conv[eê]nio|valor|pagamento|autoriza[cç][aã]o|reembolso/i],
  ["scheduling_change", /cancelar|remarcar|alterar.*agenda|hor[aá]rio|disponibil|\b\d{1,2}[\/.\-]\d{1,2}\b/i],
];

/**
 * Conservative rule engine: it deliberately prefers a human review in a health-care
 * workflow. The model can propose text, but this policy controls whether it may be sent.
 */
export function decideApproval(input: {
  message: string;
  confidence?: number;
  isKnownContact?: boolean;
}): ApprovalDecision {
  const reasons = sensitivePatterns
    .filter(([, pattern]) => pattern.test(input.message))
    .map(([reason]) => reason);

  if ((input.confidence ?? 1) < 0.86) reasons.push("low_confidence");
  if (!input.isKnownContact) reasons.push("new_contact");

  return { requiresApproval: reasons.length > 0, reasons: [...new Set(reasons)] };
}
