/** postMessage channel: studio ↔ preview iframe */
export const VAULT_PREVIEW_MESSAGE_TYPE = "vault-preview" as const;
/** postMessage: iframe → parent requesting the latest payload */
export const VAULT_PREVIEW_REQUEST_TYPE = "vault-preview-request" as const;
