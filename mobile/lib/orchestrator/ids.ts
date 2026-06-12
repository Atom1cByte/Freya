let messageCounter = 0;
let approvalCounter = 0;

export function createId(prefix: string): string {
  messageCounter += 1;
  return `${prefix}-${Date.now()}-${messageCounter}`;
}

export function createApprovalId(): string {
  approvalCounter += 1;
  return `approval-${Date.now()}-${approvalCounter}`;
}
