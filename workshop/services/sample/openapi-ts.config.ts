import { defineConfig, defaultPlugins } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'api/openapi.yaml',
  output: 'src/generated',
  plugins: [
    ...defaultPlugins,
    '@hey-api/client-fetch',
    'zod',
    {
      enums: 'javascript', 
      name: '@hey-api/typescript',
    },
    {
      name: '@hey-api/schemas',
      type: 'json', 
    },
    {
      name: '@hey-api/transformers',
      dates: true  // Will transform date strings to Date objects in clients
    }
  ]
}); 