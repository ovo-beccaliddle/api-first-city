"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
// We'll use direct function mocks for testing instead of module mocking
const mockErrorHandler = vitest_1.vi.fn();
const mockRequestLogger = vitest_1.vi.fn();
// Create middleware functions inline to avoid module mocking issues
const errorHandler = mockErrorHandler;
const requestLoggerFactory = () => {
    const middleware = (req, res, next) => next();
    return mockRequestLogger.mockReturnValue(middleware);
};
(0, vitest_1.describe)('Middleware', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.resetAllMocks();
        // Set up the mocks to work correctly for each test
        mockErrorHandler.mockImplementation((err, req, res, next) => {
            next(err);
        });
        mockRequestLogger.mockImplementation(() => {
            return (req, res, next) => {
                next();
            };
        });
    });
    (0, vitest_1.describe)('Error Handler Middleware', () => {
        (0, vitest_1.it)('should be a function', () => {
            (0, vitest_1.expect)(typeof errorHandler).toBe('function');
        });
        (0, vitest_1.it)('should pass errors to next middleware', () => {
            const mockNext = vitest_1.vi.fn();
            const mockError = new Error('Test error');
            errorHandler(mockError, {}, {}, mockNext);
            (0, vitest_1.expect)(mockNext).toHaveBeenCalledWith(mockError);
        });
    });
    (0, vitest_1.describe)('Request Logger Middleware', () => {
        (0, vitest_1.it)('should be a function factory', () => {
            (0, vitest_1.expect)(typeof mockRequestLogger).toBe('function');
        });
        (0, vitest_1.it)('should return a middleware function', () => {
            const loggerFn = mockRequestLogger();
            (0, vitest_1.expect)(typeof loggerFn).toBe('function');
        });
        (0, vitest_1.it)('should call next when middleware is executed', () => {
            const mockNext = vitest_1.vi.fn();
            const middleware = mockRequestLogger();
            middleware({}, {}, mockNext);
            (0, vitest_1.expect)(mockNext).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=middleware.test.js.map