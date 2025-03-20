"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mocks = void 0;
// Global test setup for event-bus tests
const vitest_1 = require("vitest");
// Mock functions that will be used across all tests
exports.mocks = {
    publish: vitest_1.vi.fn().mockResolvedValue('mock-message-id'),
    exists: vitest_1.vi.fn().mockResolvedValue([true]),
    createTopic: vitest_1.vi.fn().mockResolvedValue([{ name: 'mock-topic' }]),
    createSubscription: vitest_1.vi.fn().mockResolvedValue([
        {
            on: vitest_1.vi.fn(),
            close: vitest_1.vi.fn().mockResolvedValue(undefined),
            removeListener: vitest_1.vi.fn(),
        },
    ]),
    subscriptionOn: vitest_1.vi.fn(),
    subscriptionClose: vitest_1.vi.fn().mockResolvedValue(undefined),
    subscriptionRemoveListener: vitest_1.vi.fn(),
};
// Spy on mocks to track calls
vitest_1.vi.spyOn(exports.mocks, 'publish');
vitest_1.vi.spyOn(exports.mocks, 'exists');
vitest_1.vi.spyOn(exports.mocks, 'createTopic');
vitest_1.vi.spyOn(exports.mocks, 'createSubscription');
// Mock the entire @google-cloud/pubsub module
vitest_1.vi.mock('@google-cloud/pubsub', () => {
    return {
        PubSub: vitest_1.vi.fn().mockImplementation(() => ({
            topic: vitest_1.vi.fn().mockImplementation((name) => ({
                name,
                publish: exports.mocks.publish,
                exists: exports.mocks.exists,
                createSubscription: exports.mocks.createSubscription,
            })),
            createTopic: exports.mocks.createTopic,
        })),
    };
});
// Reset all mocks before each test
(0, vitest_1.beforeEach)(() => {
    vitest_1.vi.clearAllMocks();
    // Reset default behaviors
    exports.mocks.exists.mockResolvedValue([true]);
    exports.mocks.publish.mockResolvedValue('mock-message-id');
    exports.mocks.createTopic.mockResolvedValue([{ name: 'mock-topic' }]);
    exports.mocks.createSubscription.mockResolvedValue([
        {
            on: exports.mocks.subscriptionOn,
            close: exports.mocks.subscriptionClose,
            removeListener: exports.mocks.subscriptionRemoveListener,
        },
    ]);
    exports.mocks.subscriptionClose.mockResolvedValue(undefined);
});
// Mute console output to reduce noise during tests
vitest_1.vi.spyOn(console, 'log').mockImplementation(() => { });
vitest_1.vi.spyOn(console, 'error').mockImplementation(() => { });
//# sourceMappingURL=setup.js.map