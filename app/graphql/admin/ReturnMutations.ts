// NOTE: https://shopify.dev/docs/api/admin-graphql
// Admin API mutations for return management
// These are for future admin dashboard implementation

/**
 * Mutation to approve a return request
 * Admin approves the return and provides instructions to customer
 */
export const APPROVE_RETURN_MUTATION = `#graphql
  fragment ReturnMoney on MoneyV2 {
    amount
    currencyCode
  }

  fragment AdminReturnLineItem on ReturnLineItem {
    id
    quantity
    returnReason
    customerNote
    returnReasonNote
    refundableQuantity
    refundedQuantity
    totalWeight {
      unit
      value
    }
  }

  fragment AdminReturnDetails on Return {
    id
    name
    status
    totalQuantity
    order {
      id
      name
      processedAt
      customer {
        id
        email
        firstName
        lastName
      }
    }
    returnLineItems(first: 50) {
      edges {
        node {
          ...AdminReturnLineItem
          fulfillmentLineItem {
            lineItem {
              id
              name
              title
              variantTitle
              quantity
              image {
                url
                altText
              }
              originalUnitPriceSet {
                shopMoney {
                  ...ReturnMoney
                }
              }
            }
          }
        }
      }
    }
    createdAt
    updatedAt
  }

  mutation ApproveReturn(
    $input: ReturnApproveRequestInput!
  ) {
    returnApproveRequest(input: $input) {
      return {
        ...AdminReturnDetails
      }
      userErrors {
        field
        message
        code
      }
    }
  }
` as const;

/**
 * Mutation to decline a return request
 * Admin declines the return with a reason
 */
export const DECLINE_RETURN_MUTATION = `#graphql
  mutation DeclineReturn(
    $input: ReturnDeclineRequestInput!
  ) {
    returnDeclineRequest(input: $input) {
      return {
        id
        status
        declineReason
      }
      userErrors {
        field
        message
        code
      }
    }
  }
` as const;

/**
 * Mutation to close a return
 * Admin closes the return after processing
 */
export const CLOSE_RETURN_MUTATION = `#graphql
  mutation CloseReturn(
    $input: ReturnCloseInput!
  ) {
    returnClose(input: $input) {
      return {
        id
        status
      }
      userErrors {
        field
        message
        code
      }
    }
  }
` as const;

/**
 * Mutation to create a refund for a return
 * Admin processes the refund after receiving returned items
 */
export const CREATE_REFUND_MUTATION = `#graphql
  fragment RefundMoney on MoneyV2 {
    amount
    currencyCode
  }

  fragment RefundLineItemDetails on RefundLineItem {
    id
    quantity
    restockType
    restocked
    lineItem {
      id
      name
      title
      variantTitle
    }
    priceSet {
      shopMoney {
        ...RefundMoney
      }
    }
    subtotalSet {
      shopMoney {
        ...RefundMoney
      }
    }
    totalTaxSet {
      shopMoney {
        ...RefundMoney
      }
    }
  }

  fragment RefundDetails on Refund {
    id
    createdAt
    note
    totalRefundedSet {
      shopMoney {
        ...RefundMoney
      }
    }
    refundLineItems(first: 50) {
      edges {
        node {
          ...RefundLineItemDetails
        }
      }
    }
    order {
      id
      name
    }
    return {
      id
      name
      status
    }
  }

  mutation CreateRefund(
    $input: RefundInput!
  ) {
    refundCreate(input: $input) {
      refund {
        ...RefundDetails
      }
      userErrors {
        field
        message
        code
      }
    }
  }
` as const;

/**
 * Mutation to reopen a return
 * Admin can reopen a closed return if needed
 */
export const REOPEN_RETURN_MUTATION = `#graphql
  mutation ReopenReturn(
    $input: ReturnReopenInput!
  ) {
    returnReopen(input: $input) {
      return {
        id
        status
      }
      userErrors {
        field
        message
        code
      }
    }
  }
` as const;

/**
 * Query to get return details for admin
 * Includes full order and customer information
 */
export const ADMIN_RETURN_QUERY = `#graphql
  fragment ReturnMoney on MoneyV2 {
    amount
    currencyCode
  }

  fragment AdminReturnLineItem on ReturnLineItem {
    id
    quantity
    returnReason
    customerNote
    returnReasonNote
    refundableQuantity
    refundedQuantity
  }

  fragment AdminReturnDetails on Return {
    id
    name
    status
    totalQuantity
    declineReason
    order {
      id
      name
      processedAt
      fulfillmentStatus
      displayFinancialStatus
      customer {
        id
        email
        firstName
        lastName
        phone
      }
      shippingAddress {
        address1
        address2
        city
        province
        country
        zip
      }
    }
    returnLineItems(first: 50) {
      edges {
        node {
          ...AdminReturnLineItem
          fulfillmentLineItem {
            lineItem {
              id
              name
              title
              variantTitle
              quantity
              image {
                url
                altText
              }
              originalUnitPriceSet {
                shopMoney {
                  ...ReturnMoney
                }
              }
            }
          }
        }
      }
    }
    refunds(first: 10) {
      edges {
        node {
          id
          createdAt
          totalRefundedSet {
            shopMoney {
              ...ReturnMoney
            }
          }
        }
      }
    }
    createdAt
    updatedAt
  }

  query AdminReturn($id: ID!) {
    return(id: $id) {
      ...AdminReturnDetails
    }
  }
` as const;

/**
 * Query to list all returns for admin dashboard
 * Supports filtering and pagination
 */
export const ADMIN_RETURNS_QUERY = `#graphql
  fragment ReturnMoney on MoneyV2 {
    amount
    currencyCode
  }

  fragment AdminReturnSummary on Return {
    id
    name
    status
    totalQuantity
    order {
      id
      name
      customer {
        id
        email
        firstName
        lastName
      }
    }
    createdAt
    updatedAt
  }

  query AdminReturns(
    $first: Int = 50
    $after: String
    $query: String
    $sortKey: ReturnSortKeys
    $reverse: Boolean
  ) {
    returns(
      first: $first
      after: $after
      query: $query
      sortKey: $sortKey
      reverse: $reverse
    ) {
      edges {
        node {
          ...AdminReturnSummary
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
` as const;
