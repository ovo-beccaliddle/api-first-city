"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Global test setup
const vitest_1 = require("vitest");
// Mock firebase-admin
vitest_1.vi.mock('firebase-admin/app', () => {
    return {
        initializeApp: vitest_1.vi.fn().mockReturnValue({}),
        cert: vitest_1.vi.fn().mockReturnValue({}),
    };
});
// Mock firebase-admin/remote-config
vitest_1.vi.mock('firebase-admin/remote-config', () => {
    return {
        getRemoteConfig: vitest_1.vi.fn().mockReturnValue({
            getTemplate: vitest_1.vi.fn().mockResolvedValue({
                parameters: {
                    'test.key': {
                        defaultValue: {
                            text: 'test-value',
                        },
                    },
                    'workshop.test.key': {
                        defaultValue: {
                            text: 'workshop-test-value',
                        },
                    },
                    'team-01.test.key': {
                        defaultValue: {
                            text: 'team-test-value',
                        },
                    },
                    'team-01.sample-service.test.key': {
                        defaultValue: {
                            text: 'team-service-test-value',
                        },
                    },
                    'json.key': {
                        defaultValue: {
                            text: '{"foo":"bar"}',
                        },
                    },
                    'boolean.key': {
                        defaultValue: {
                            text: 'true',
                        },
                    },
                    'number.key': {
                        defaultValue: {
                            text: '42',
                        },
                    },
                },
            }),
        }),
    };
});
// Mock Logger from the logging module
vitest_1.vi.mock('../logging', () => {
    return {
        Logger: vitest_1.vi.fn().mockImplementation(() => ({
            info: vitest_1.vi.fn(),
            warn: vitest_1.vi.fn(),
            error: vitest_1.vi.fn(),
            debug: vitest_1.vi.fn(),
        })),
    };
});
//# sourceMappingURL=setup.js.map