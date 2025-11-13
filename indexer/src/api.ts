import express from 'express';
import { postgraphile, PostGraphileOptions } from 'postgraphile';
import dotenv from 'dotenv';
import ConnectionFilterPlugin from 'postgraphile-plugin-connection-filter';
import { createServer } from 'node:http';
import { config } from './config';

dotenv.config();

const isDev = process.env.NODE_ENV === 'development';

async function main() {
  const database = config.dbUrl;

  const options: PostGraphileOptions = {
    watchPg: isDev,
    graphiql: true,
    enhanceGraphiql: isDev,
    subscriptions: true,
    dynamicJson: true,
    setofFunctionsContainNulls: false,
    disableDefaultMutations: true,
    ignoreRBAC: false,
    showErrorStack: isDev ? 'json' : true,
    extendedErrors: ['hint', 'detail', 'errcode'],
    allowExplain: isDev,
    legacyRelations: 'omit',
    exportGqlSchemaPath: `${__dirname}/schema.graphql`,
    sortExport: true,
    appendPlugins: [ConnectionFilterPlugin],
  };

  const middleware = postgraphile(database, 'public', options);
  const app = express();

  // Disable CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(middleware);

  const server = createServer(app);
  const port = process.env.GQL_PORT || 4350;

  server.listen({ host: '0.0.0.0', port }, () => {
    const address = server.address()!;

    if (typeof address !== 'string') {
      const href = `http://${address.address}:${address.port}${options.graphiqlRoute || '/graphiql'}`;

      console.log(`PostGraphiQL available at ${href} 🚀`);
    } else {
      console.log(`PostGraphile listening on ${address} 🚀`);
    }
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
