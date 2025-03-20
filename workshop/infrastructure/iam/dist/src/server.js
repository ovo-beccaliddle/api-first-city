"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("./auth");
const common_1 = require("@city-services/common");
const common_2 = require("@city-services/common");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, common_2.requestLogger)('iam-service'));
// Define available scopes for all city services
const AVAILABLE_SCOPES = {
    'sample-service': ['read:sample', 'write:sample'],
    'emergency-police-service': ['read:incidents', 'write:incidents', 'read:emergency'],
    'emergency-fire-service': ['read:emergencies', 'write:emergencies', 'read:emergency'],
    'utilities-water-service': ['read:outages', 'write:outages', 'read:usage'],
    'utilities-electric-service': ['read:outages', 'write:outages', 'read:consumption', 'read:grid'],
    'transportation-traffic-service': [
        'read:congestion',
        'read:incidents',
        'write:incidents',
        'read:closures',
    ],
    'transportation-transit-service': [
        'read:routes',
        'read:vehicles',
        'read:schedule',
        'read:delays',
    ],
    'citizen-requests-service': ['read:requests', 'write:requests', 'read:categories'],
    'citizen-permits-service': ['read:permits', 'write:permits', 'read:permit-types'],
};
// In a real system, clients would be stored in a database with proper hashing for secrets
const VALID_CLIENTS = {
    'sample-service': 'sample-service-secret',
    'emergency-police-service': 'police-service-secret',
    'emergency-fire-service': 'fire-service-secret',
    'utilities-water-service': 'water-service-secret',
    'utilities-electric-service': 'electric-service-secret',
    'transportation-traffic-service': 'traffic-service-secret',
    'transportation-transit-service': 'transit-service-secret',
    'citizen-requests-service': 'requests-service-secret',
    'citizen-permits-service': 'permits-service-secret',
    'city-admin-app': 'city-admin-secret',
    'citizen-app': 'citizen-app-secret',
};
// Helper function to validate client credentials
function validateClient(clientId, clientSecret) {
    return VALID_CLIENTS[clientId] === clientSecret;
}
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// OAuth token endpoint
app.post('/oauth/token', (req, res) => {
    const { client_id, client_secret, grant_type, scope } = req.body;
    // Validate request parameters
    if (!client_id || !client_secret) {
        return res
            .status(400)
            .json({ error: 'invalid_request', error_description: 'Missing client credentials' });
    }
    if (grant_type !== 'client_credentials') {
        return res
            .status(400)
            .json({
            error: 'unsupported_grant_type',
            error_description: 'Only client_credentials grant type is supported',
        });
    }
    // Validate client credentials
    if (!validateClient(client_id, client_secret)) {
        return res
            .status(401)
            .json({ error: 'invalid_client', error_description: 'Invalid client credentials' });
    }
    // Parse and validate requested scopes
    const requestedScopes = scope ? scope.split(' ') : [];
    const allowedScopes = AVAILABLE_SCOPES[client_id] || [];
    const grantedScopes = requestedScopes.filter((s) => allowedScopes.includes(s));
    if (grantedScopes.length === 0) {
        return res
            .status(400)
            .json({ error: 'invalid_scope', error_description: 'No valid scopes requested' });
    }
    // Generate token with granted scopes
    const token = (0, auth_1.generateToken)({
        client_id,
        scope: grantedScopes.join(' '),
    });
    return res.json({
        access_token: token,
        token_type: 'bearer',
        expires_in: 3600,
        scope: grantedScopes.join(' '),
    });
});
// Token introspection endpoint for gateway validation
app.post('/oauth/introspect', (req, res) => {
    const token = req.body.token;
    if (!token) {
        return res
            .status(400)
            .json({ error: 'invalid_request', error_description: 'Missing token parameter' });
    }
    try {
        const decoded = (0, auth_1.verifyToken)(token);
        return res.json({
            active: true,
            scope: decoded.scope,
            client_id: decoded.client_id,
            exp: decoded.exp,
        });
    }
    catch (err) {
        return res.json({ active: false });
    }
});
// JWKS endpoint for validating tokens
app.get('/.well-known/jwks.json', (req, res) => {
    // In a real implementation, this would return the public keys used to verify tokens
    // For the workshop, we'll return a mock JWKS
    res.json({
        keys: [
            {
                kty: 'RSA',
                kid: 'workshop-key-1',
                use: 'sig',
                alg: 'RS256',
                // These would be real public key parameters in a production system
                n: 'mock-modulus',
                e: 'AQAB',
            },
        ],
    });
});
// Add error handler middleware
app.use(common_1.errorHandler);
// Start the server
const PORT = process.env.PORT || 3000;
// Only start the server if this file is run directly (not imported for testing)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`IAM Service running on port ${PORT}`);
    });
}
// Export the app for testing
exports.default = app;
//# sourceMappingURL=server.js.map