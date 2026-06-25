import type {IGraphQLConfig} from 'graphql-config';
import {getSchema} from '@shopify/hydrogen-codegen';

/**
 * GraphQL Config
 * @see https://the-guild.dev/graphql/config/docs/user/usage
 * @type {IGraphQLConfig}
 */
const graphqlConfig: IGraphQLConfig = {
  projects: {
    default: {
      schema: getSchema('storefront'),
      documents: [
        './*.{ts,tsx,js,jsx}',
        './app/**/*.{ts,tsx,js,jsx}',
        '!./app/graphql/**/*.{ts,tsx,js,jsx}',
        '!./app/routes/account*.tsx',
        '!./app/routes/account.*.tsx',
      ],
    },

    // Customer Account API — account routes use context.customerAccount.query()
    customerAccount: {
      schema: getSchema('customer-account'),
      documents: [
        './app/routes/account*.tsx',
        './app/routes/account.*.tsx',
      ],
    },
  },
};

export default graphqlConfig;
