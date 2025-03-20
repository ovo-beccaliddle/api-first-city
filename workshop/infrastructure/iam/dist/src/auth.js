"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.generateRefreshToken = generateRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Secret key for JWT signing - in a real system, this would be stored securely
// and potentially be a private key for asymmetric signing
const JWT_SECRET = process.env.JWT_SECRET || 'workshop-secret-key';
// Token expiration time in seconds
const TOKEN_EXPIRATION = 14400; // 4 hours
/**
 * Generate a JWT token with the given payload
 */
function generateToken(payload) {
    // Add expiration and issued at timestamps
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
        ...payload,
        iat: now,
        exp: now + TOKEN_EXPIRATION,
    };
    // Sign the token
    return jsonwebtoken_1.default.sign(tokenPayload, JWT_SECRET);
}
/**
 * Verify a JWT token and return the decoded payload
 */
function verifyToken(token) {
    try {
        // Verify and decode the token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        // In a real system, you would log the error
        throw new Error('Invalid token');
    }
}
/**
 * Generate a refresh token (for the workshop we'll use a simple UUID)
 * In a real system, you would use a more secure method
 */
function generateRefreshToken() {
    return `refresh-${Math.random().toString(36).substring(2, 15)}`;
}
//# sourceMappingURL=auth.js.map