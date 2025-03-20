import jwt from 'jsonwebtoken';

// Secret key for JWT signing - in a real system, this would be stored securely
// and potentially be a private key for asymmetric signing
const JWT_SECRET = process.env.JWT_SECRET || 'workshop-secret-key';

// Token expiration time in seconds
const TOKEN_EXPIRATION = 14400; // 4 hours

// Interface for token payload
interface TokenPayload {
  client_id: string;
  scope: string;
  exp?: number;
  iat?: number;
}

/**
 * Generate a JWT token with the given payload
 */
export function generateToken(payload: Omit<TokenPayload, 'exp' | 'iat'>): string {
  // Add expiration and issued at timestamps
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: now + TOKEN_EXPIRATION,
  };

  // Sign the token
  return jwt.sign(tokenPayload, JWT_SECRET);
}

/**
 * Verify a JWT token and return the decoded payload
 */
export function verifyToken(token: string): TokenPayload {
  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    // In a real system, you would log the error
    throw new Error('Invalid token');
  }
}

/**
 * Generate a refresh token (for the workshop we'll use a simple UUID)
 * In a real system, you would use a more secure method
 */
export function generateRefreshToken(): string {
  return `refresh-${Math.random().toString(36).substring(2, 15)}`;
}
