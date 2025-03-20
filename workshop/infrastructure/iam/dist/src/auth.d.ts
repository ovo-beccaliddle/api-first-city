interface TokenPayload {
    client_id: string;
    scope: string;
    exp?: number;
    iat?: number;
}
/**
 * Generate a JWT token with the given payload
 */
export declare function generateToken(payload: Omit<TokenPayload, 'exp' | 'iat'>): string;
/**
 * Verify a JWT token and return the decoded payload
 */
export declare function verifyToken(token: string): TokenPayload;
/**
 * Generate a refresh token (for the workshop we'll use a simple UUID)
 * In a real system, you would use a more secure method
 */
export declare function generateRefreshToken(): string;
export {};
