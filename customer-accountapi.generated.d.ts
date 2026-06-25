/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as CustomerAccountAPI from '@shopify/hydrogen/customer-account-api-types';

export type CustomerDetailsQueryVariables = CustomerAccountAPI.Exact<{
  [key: string]: never;
}>;

export type CustomerDetailsQuery = {
  customer: Pick<CustomerAccountAPI.Customer, 'firstName' | 'lastName'> & {
    emailAddress?: CustomerAccountAPI.Maybe<
      Pick<CustomerAccountAPI.CustomerEmailAddress, 'emailAddress'>
    >;
    orders: {
      nodes: Array<
        Pick<
          CustomerAccountAPI.Order,
          | 'id'
          | 'number'
          | 'processedAt'
          | 'financialStatus'
          | 'fulfillmentStatus'
        > & {
          totalPrice: Pick<
            CustomerAccountAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          lineItems: {
            nodes: Array<
              Pick<CustomerAccountAPI.LineItem, 'title' | 'quantity'>
            >;
          };
        }
      >;
    };
  };
};

export type OrderDetailsQueryVariables = CustomerAccountAPI.Exact<{
  orderId: CustomerAccountAPI.Scalars['ID']['input'];
}>;

export type OrderDetailsQuery = {
  order?: CustomerAccountAPI.Maybe<
    Pick<
      CustomerAccountAPI.Order,
      | 'id'
      | 'name'
      | 'number'
      | 'processedAt'
      | 'financialStatus'
      | 'fulfillmentStatus'
    > & {
      totalPrice: Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>;
      subtotal?: CustomerAccountAPI.Maybe<
        Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      totalShipping: Pick<
        CustomerAccountAPI.MoneyV2,
        'amount' | 'currencyCode'
      >;
      totalTax?: CustomerAccountAPI.Maybe<
        Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      shippingAddress?: CustomerAccountAPI.Maybe<
        Pick<
          CustomerAccountAPI.CustomerAddress,
          'name' | 'address1' | 'address2' | 'city' | 'country' | 'zip'
        >
      >;
      lineItems: {
        nodes: Array<
          Pick<CustomerAccountAPI.LineItem, 'title' | 'quantity'> & {
            price?: CustomerAccountAPI.Maybe<
              Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            image?: CustomerAccountAPI.Maybe<
              Pick<
                CustomerAccountAPI.Image,
                'url' | 'altText' | 'width' | 'height'
              >
            >;
            currentTotalPrice?: CustomerAccountAPI.Maybe<
              Pick<CustomerAccountAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
          }
        >;
      };
    }
  >;
};

interface GeneratedQueryTypes {
  '#graphql\n  query CustomerDetails {\n    customer {\n      firstName\n      lastName\n      emailAddress {\n        emailAddress\n      }\n      orders(first: 10, sortKey: CREATED_AT, reverse: true) {\n        nodes {\n          id\n          number\n          processedAt\n          financialStatus\n          fulfillmentStatus\n          totalPrice {\n            amount\n            currencyCode\n          }\n          lineItems(first: 2) {\n            nodes {\n              title\n              quantity\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: CustomerDetailsQuery;
    variables: CustomerDetailsQueryVariables;
  };
  '#graphql\n  query OrderDetails($orderId: ID!) {\n    order(id: $orderId) {\n      id\n      name\n      number\n      processedAt\n      financialStatus\n      fulfillmentStatus\n      totalPrice {\n        amount\n        currencyCode\n      }\n      subtotal {\n        amount\n        currencyCode\n      }\n      totalShipping {\n        amount\n        currencyCode\n      }\n      totalTax {\n        amount\n        currencyCode\n      }\n      shippingAddress {\n        name\n        address1\n        address2\n        city\n        country\n        zip\n      }\n      lineItems(first: 100) {\n        nodes {\n          title\n          quantity\n          price {\n            amount\n            currencyCode\n          }\n          image {\n            url\n            altText\n            width\n            height\n          }\n          currentTotalPrice {\n            amount\n            currencyCode\n          }\n        }\n      }\n    }\n  }\n': {
    return: OrderDetailsQuery;
    variables: OrderDetailsQueryVariables;
  };
}

interface GeneratedMutationTypes {}

declare module '@shopify/hydrogen' {
  interface CustomerAccountQueries extends GeneratedQueryTypes {}
  interface CustomerAccountMutations extends GeneratedMutationTypes {}
}
