"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
const path_1 = __importDefault(require("path"));
exports.default = (0, config_1.defineConfig)({
    test: {
        globals: true,
        environment: 'node',
        include: ['**/__tests__/**/*.test.ts'],
        exclude: ['**/node_modules/**', '**/dist/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: ['**/node_modules/**', '**/dist/**', '**/__tests__/**', '**/*.d.ts'],
        },
        setupFiles: [path_1.default.resolve(__dirname, './__tests__/setup.ts')],
    },
    resolve: {
        alias: {
            '@city-services/common': path_1.default.resolve(__dirname),
        },
    },
});
//# sourceMappingURL=vitest.config.js.map