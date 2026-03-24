export type SharableErrorType = "NO-ACCESS" | "LINK-EXPIRED" | "INCORRECT-PASSWORD" | "ACCESS-LIMIT-CROSSED" | "NOT-FOUND"
export const ERROR_MAP: Record<number, SharableErrorType> = {
    4002: 'NO-ACCESS',
    5004: 'LINK-EXPIRED',
    5008: 'INCORRECT-PASSWORD',
    5006: 'ACCESS-LIMIT-CROSSED',
    5002: 'NOT-FOUND'
};
