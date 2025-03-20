import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  "./workshop/common/vitest.config.ts",
  "./workshop/infrastructure/service-registry/vitest.config.ts",
  "./workshop/common/dist/vitest.config.js",
  "./workshop/infrastructure/event-bus/vitest.config.ts",
  "./workshop/infrastructure/iam/vitest.config.ts",
  "./workshop/services/sample/vitest.config.ts"
])
