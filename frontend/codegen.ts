import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: process.env.VITE_INDEXER_ADDRESS, // needs --require dotenv/config
  documents: ['src/**/*.{ts,tsx}'],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: { './src/api/graphql/codegen/': { preset: 'client' } },
};

export default config;
