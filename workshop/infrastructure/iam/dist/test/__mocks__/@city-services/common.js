"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = exports.errorHandler = void 0;
// Mock for @city-services/common package
const vitest_1 = require("vitest");
// Mock for error handler middleware
exports.errorHandler = vitest_1.vi.fn((err, req, res, next) => {
    // Simple implementation that passes the error to the next middleware
    if (next) {
        next(err);
    }
});
// Mock for request logger middleware
exports.requestLogger = vitest_1.vi.fn((serviceName) => {
    // Return a middleware function that simply calls next
    return (req, res, next) => {
        if (typeof next === 'function') {
            next();
        }
    };
});
//# sourceMappingURL=common.js.map