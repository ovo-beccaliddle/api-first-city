"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = exports.errorHandler = void 0;
const vitest_1 = require("vitest");
// Mock middleware for testing
exports.errorHandler = vitest_1.vi.fn((err, req, res, next) => next(err));
exports.requestLogger = vitest_1.vi.fn((service) => {
    return (req, res, next) => next();
});
//# sourceMappingURL=common.js.map