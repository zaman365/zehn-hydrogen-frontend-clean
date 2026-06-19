# Database Design: Return Management System

## Overview

This Return Management System uses **Shopify as the single source of truth** for all return data. No custom database tables are created. All return operations are performed via:

1. **Shopify Customer Account API** (GraphQL) - For customer-facing return requests
2. **Shopify Admin API** (GraphQL) - For admin return management and refund processing
3. **Shopify Webhooks** - For real-time status updates

## Architecture Decision

**Why No Custom Database?**

- Shopify already provides comprehensive return management infrastructure
- Eliminates data synchronization issues between custom DB and Shopify
- Reduces infrastructure complexity and maintenance overhead
- Leverages Shopify's built-in return workflow, refund processing, and inventory management
- Ensures data consistency across all Shopify channels (admin, POS, online store)

## Shopify's Return Data Model

### Core Objects

Shopify's return system consists of four primary objects:

```
Order (existing)
  └── Return
       ├── ReturnLineItem[]
       ├── Refund (optional)
       └── ExchangeLineItem[] (optional)
```

### 1. Return Object

The `Return` object represents a customer's return request and tracks its lifecycle.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | ID! | Global ID (format: `gid://shopify/Return/{id}`) |
| `name` | String | Human-readable return name (e.g., "#1001-R1") |
| `status` | ReturnStatus! | Current status (see status enum below) |
| `order` | Order! | The original order being returned |
| `returnLineItems` | ReturnLineItemConnection! | Items being returned |
| `totalQuantity` | Int! | Total number of items in return |
| `decline` | ReturnDecline | Decline details if rejected |
| `refund` | Refund | Associated refund if processed |
| `exchangeLineItems` | ExchangeLineItemConnection | Items for exchange |
| `createdAt` | DateTime! | When return was created |
| `updatedAt` | DateTime! | Last update timestamp |

**ReturnStatus Enum:**

```graphql
enum ReturnStatus {
  REQUESTED          # Customer submitted return request
  OPEN               # Return approved, awaiting items
  IN_TRANSIT         # Items shipped back to merchant
  INSPECTION         # Items received, being inspected
  CLOSED             # Return completed (refunded/exchanged)
  DECLINED           # Return rejected
  CANCELED           # Return canceled by customer
}
```

**ReturnDecline Object:**

| Field | Type | Description |
|-------|------|-------------|
| `reason` | ReturnDeclineReason! | Why return was declined |
| `note` | String | Additional explanation |

**ReturnDeclineReason Enum:**

```graphql
enum ReturnDeclineReason {
  FINAL_SALE              # Item marked as final sale
  OUTSIDE_RETURN_WINDOW   # Past 30-day window
  INCORRECT_ITEM          # Wrong item sent back
  DAMAGED_ITEM            # Item damaged by customer
  WORN_ITEM               # Item shows signs of wear
  OTHER                   # Other reason (see note)
}
```

### 2. ReturnLineItem Object

Represents individual items within a return request.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | ID! | Global ID |
| `quantity` | Int! | Number of units being returned |
| `returnReason` | ReturnReason! | Why item is being returned |
| `returnReasonNote` | String | Additional details from customer |
| `customerNote` | String | Customer's explanation |
| `fulfillmentLineItem` | FulfillmentLineItem! | Original fulfilled item |
| `refundableQuantity` | Int! | Max quantity eligible for refund |
| `refundedQuantity` | Int! | Quantity already refunded |
| `totalWeight` | Weight | Total weight of returned items |
| `withCodeDiscountedTotalPriceSet` | MoneyBag! | Price after discounts |

**ReturnReason Enum:**

```graphql
enum ReturnReason {
  SIZE_TOO_SMALL          # Item too small
  SIZE_TOO_LARGE          # Item too large
  UNWANTED                # Changed mind
  STYLE                   # Don't like style/color
  DEFECTIVE               # Manufacturing defect
  NOT_AS_DESCRIBED        # Doesn't match description
  WRONG_ITEM              # Received wrong item
  ARRIVED_DAMAGED         # Damaged in shipping
  OTHER                   # Other reason
}
```

### 3. Refund Object

Represents the financial refund processed for a return.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | ID! | Global ID |
| `return` | Return | Associated return |
| `order` | Order! | Original order |
| `refundLineItems` | RefundLineItemConnection! | Items being refunded |
| `totalRefundedSet` | MoneyBag! | Total amount refunded |
| `transactions` | OrderTransactionConnection! | Payment transactions |
| `createdAt` | DateTime! | When refund was processed |
| `processedAt` | DateTime | When refund completed |

**RefundLineItem Object:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | ID! | Global ID |
| `lineItem` | LineItem! | Original order line item |
| `quantity` | Int! | Quantity refunded |
| `subtotalSet` | MoneyBag! | Refund amount before tax |
| `totalTaxSet` | MoneyBag! | Tax refunded |
| `restockType` | RefundLineItemRestockType! | How inventory is handled |

**RefundLineItemRestockType Enum:**

```graphql
enum RefundLineItemRestockType {
  RETURN              # Item returned to inventory
  CANCEL              # Order canceled, restock
  LEGACY_RESTOCK      # Legacy restock behavior
  NO_RESTOCK          # Don't restock (damaged/defective)
}
```

### 4. ExchangeLineItem Object (Future Enhancement)

For exchanges instead of refunds (out of scope for MVP).

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | ID! | Global ID |
| `lineItem` | LineItem! | New item being sent |
| `quantity` | Int! | Quantity of new item |

## GraphQL API Schemas

### Customer Account API (Customer-Facing)

#### Query: Get Customer Returns

```graphql
query CustomerReturns(
  $first: Int = 10
  $after: String
  $language: LanguageCode
) @inContext(language: $language) {
  customer {
    returns(first: $first, after: $after) {
      nodes {
        id
        name
        status
        totalQuantity
        createdAt
        order {
          id
          name
          processedAt
        }
        returnLineItems(first: 50) {
          nodes {
            id
            quantity
            returnReason
            returnReasonNote
            customerNote
            fulfillmentLineItem {
              lineItem {
                id
                title
                variant {
                  id
                  title
                  image {
                    url
                    altText
                  }
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
        decline {
          reason
          note
        }
        refund {
          id
          totalRefundedSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          createdAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}
```

#### Mutation: Create Return Request

```graphql
mutation ReturnRequest(
  $returnInput: ReturnRequestInput!
) {
  returnRequest(input: $returnInput) {
    return {
      id
      name
      status
      order {
        id
        name
      }
      returnLineItems(first: 50) {
        nodes {
          id
          quantity
          returnReason
          returnReasonNote
        }
      }
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

**ReturnRequestInput:**

```graphql
input ReturnRequestInput {
  orderId: ID!                          # Order being returned
  returnLineItems: [ReturnLineItemInput!]!
  notifyCustomer: Boolean = true        # Send email notification
  requestedAt: DateTime                 # When customer requested
}

input ReturnLineItemInput {
  fulfillmentLineItemId: ID!            # Item to return
  quantity: Int!                        # How many units
  returnReason: ReturnReason!           # Why returning
  returnReasonNote: String              # Additional details
  customerNote: String                  # Customer explanation
}
```

**UserError Response:**

```graphql
type ReturnUserError {
  field: [String!]
  message: String!
  code: ReturnErrorCode
}

enum ReturnErrorCode {
  RETURN_DOES_NOT_EXIST
  INVALID_LINE_ITEM
  OUTSIDE_RETURN_WINDOW
  ORDER_NOT_FULFILLED
  QUANTITY_EXCEEDS_AVAILABLE
  INVALID_RETURN_REASON
}
```

### Admin API (Admin-Facing)

#### Query: Get Return Details

```graphql
query GetReturn($id: ID!) {
  return(id: $id) {
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
    returnLineItems(first: 50) {
      nodes {
        id
        quantity
        returnReason
        returnReasonNote
        customerNote
        refundableQuantity
        refundedQuantity
        fulfillmentLineItem {
          lineItem {
            id
            title
            variant {
              id
              title
              sku
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
    decline {
      reason
      note
    }
    refund {
      id
      totalRefundedSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      processedAt
    }
    createdAt
    updatedAt
  }
}
```

#### Mutation: Approve Return

```graphql
mutation ReturnApprove($id: ID!) {
  returnApprove(id: $id) {
    return {
      id
      status
    }
    userErrors {
      field
      message
    }
  }
}
```

#### Mutation: Decline Return

```graphql
mutation ReturnDecline(
  $id: ID!
  $declineReason: ReturnDeclineReason!
  $note: String
) {
  returnDecline(
    id: $id
    declineReason: $declineReason
    note: $note
  ) {
    return {
      id
      status
      decline {
        reason
        note
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

#### Mutation: Process Refund

```graphql
mutation RefundCreate($input: RefundInput!) {
  refundCreate(input: $input) {
    refund {
      id
      totalRefundedSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      refundLineItems(first: 50) {
        nodes {
          lineItem {
            id
            title
          }
          quantity
          subtotalSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          restockType
        }
      }
      transactions(first: 10) {
        id
        status
        amount {
          amount
          currencyCode
        }
      }
      processedAt
    }
    userErrors {
      field
      message
    }
  }
}
```

**RefundInput:**

```graphql
input RefundInput {
  orderId: ID!
  returnId: ID                          # Link to return
  refundLineItems: [RefundLineItemInput!]!
  notify: Boolean = true                # Email customer
  note: String                          # Internal note
  shipping: ShippingRefundInput         # Refund shipping cost
}

input RefundLineItemInput {
  lineItemId: ID!
  quantity: Int!
  restockType: RefundLineItemRestockType = RETURN
}

input ShippingRefundInput {
  amount: Decimal!
  fullRefund: Boolean = false
}
```

## TypeScript Type Definitions

### Application Types

```typescript
// Return status for UI display
export type ReturnStatus =
  | 'REQUESTED'
  | 'OPEN'
  | 'IN_TRANSIT'
  | 'INSPECTION'
  | 'CLOSED'
  | 'DECLINED'
  | 'CANCELED';

// Return reasons customers can select
export type ReturnReason =
  | 'SIZE_TOO_SMALL'
  | 'SIZE_TOO_LARGE'
  | 'UNWANTED'
  | 'STYLE'
  | 'DEFECTIVE'
  | 'NOT_AS_DESCRIBED'
  | 'WRONG_ITEM'
  | 'ARRIVED_DAMAGED'
  | 'OTHER';

// Decline reasons for admin
export type ReturnDeclineReason =
  | 'FINAL_SALE'
  | 'OUTSIDE_RETURN_WINDOW'
  | 'INCORRECT_ITEM'
  | 'DAMAGED_ITEM'
  | 'WORN_ITEM'
  | 'OTHER';

// Main return object
export interface Return {
  id: string;
  name: string;
  status: ReturnStatus;
  order: {
    id: string;
    name: string;
    processedAt: string;
  };
  returnLineItems: ReturnLineItem[];
  totalQuantity: number;
  decline?: {
    reason: ReturnDeclineReason;
    note?: string;
  };
  refund?: {
    id: string;
    totalRefunded: Money;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Return line item
export interface ReturnLineItem {
  id: string;
  quantity: number;
  returnReason: ReturnReason;
  returnReasonNote?: string;
  customerNote?: string;
  refundableQuantity: number;
  refundedQuantity: number;
  fulfillmentLineItem: {
    lineItem: {
      id: string;
      title: string;
      variant: {
        id: string;
        title: string;
        sku?: string;
        image?: {
          url: string;
          altText?: string;
        };
        price: Money;
      };
    };
  };
}

// Money type
export interface Money {
  amount: string;
  currencyCode: string;
}

// Return request form data
export interface ReturnRequestFormData {
  orderId: string;
  items: {
    fulfillmentLineItemId: string;
    quantity: number;
    returnReason: ReturnReason;
    returnReasonNote?: string;
    customerNote?: string;
  }[];
}

// Refund request data
export interface RefundRequestData {
  orderId: string;
  returnId: string;
  items: {
    lineItemId: string;
    quantity: number;
    restockType: 'RETURN' | 'NO_RESTOCK';
  }[];
  refundShipping?: {
    amount: number;
    fullRefund: boolean;
  };
  note?: string;
}
```

## Data Access Patterns

### 1. Customer Views Return History

**Route:** `/account/returns`

**Query:** Customer Account API `customer.returns`

**Data Flow:**
```
Loader → customerAccount.query(CustomerReturnsQuery) → Shopify
       ← Returns list with pagination
```

**Caching:** None (always fetch fresh data)

### 2. Customer Views Single Return

**Route:** `/account/returns/:id`

**Query:** Customer Account API `customer.returns` (filtered by ID)

**Data Flow:**
```
Loader → customerAccount.query(CustomerReturnQuery, {id}) → Shopify
       ← Return details with line items
```

**Caching:** None (real-time status important)

### 3. Customer Submits Return Request

**Route:** `/account/orders/:id/return` (action)

**Mutation:** Customer Account API `returnRequest`

**Data Flow:**
```
Action → Validate eligibility (30-day window, fulfilled status)
       → customerAccount.mutate(ReturnRequestMutation, {input})
       → Shopify creates Return object
       ← Return ID and confirmation
       → Send email notification (via webhook or direct)
       → Redirect to /account/returns/:returnId
```

**Validation Rules:**
- Order must be fulfilled
- Within 30-day return window (processedAt + 30 days)
- Items must not be already returned
- Quantity must not exceed available quantity

### 4. Admin Views Return

**Route:** Shopify Admin → Orders → Returns

**Query:** Admin API `return(id: $id)`

**Data Flow:**
```
Admin UI → Admin API query → Return details
```

**Note:** This happens in Shopify Admin, not our Hydrogen app

### 5. Admin Approves Return

**Route:** Shopify Admin (action)

**Mutation:** Admin API `returnApprove`

**Data Flow:**
```
Admin clicks "Approve" → returnApprove(id)
                       → Status changes to OPEN
                       → Webhook fires: returns/approve
                       → Email sent to customer
```

### 6. Admin Declines Return

**Route:** Shopify Admin (action)

**Mutation:** Admin API `returnDecline`

**Data Flow:**
```
Admin clicks "Decline" → returnDecline(id, reason, note)
                       → Status changes to DECLINED
                       → Webhook fires: returns/decline
                       → Email sent to customer
```

### 7. Admin Processes Refund

**Route:** Shopify Admin (action)

**Mutation:** Admin API `refundCreate`

**Data Flow:**
```
Admin clicks "Refund" → refundCreate(input)
                      → Refund object created
                      → Payment gateway processes refund
                      → Return status → CLOSED
                      → Webhook fires: refunds/create
                      → Email sent to customer
```

## Webhook Integration

### Required Webhooks

To keep the customer-facing UI in sync with admin actions, subscribe to these webhooks:

| Webhook Topic | Trigger | Action |
|---------------|---------|--------|
| `returns/approve` | Admin approves return | Update UI status, send email |
| `returns/decline` | Admin declines return | Update UI status, send email |
| `returns/cancel` | Return canceled | Update UI status |
| `returns/close` | Return completed | Update UI status |
| `refunds/create` | Refund processed | Update UI status, send email |

**Webhook Handler Pattern:**

```typescript
// app/routes/api.webhooks.returns.tsx
export async function action({request, context}: Route.ActionArgs) {
  const {topic, shop, session, payload} = await context.shopify.authenticate.webhook(request);

  switch (topic) {
    case 'RETURNS_APPROVE':
      // Send email: "Your return has been approved"
      await sendReturnApprovedEmail(payload);
      break;

    case 'RETURNS_DECLINE':
      // Send email: "Your return has been declined"
      await sendReturnDeclinedEmail(payload);
      break;

    case 'REFUNDS_CREATE':
      // Send email: "Your refund has been processed"
      await sendRefundProcessedEmail(payload);
      break;
  }

  return json({success: true});
}
```

## Caching Strategy

### No Local Caching

**Decision:** Do NOT cache return data locally in the Hydrogen app.

**Rationale:**
- Return status changes frequently (admin actions, webhook updates)
- Stale data would confuse customers ("Why does it say REQUESTED when I got an approval email?")
- Shopify API is fast enough for real-time queries
- Eliminates cache invalidation complexity

**Exception:** Order data for return eligibility checks can be cached briefly (5 minutes) since order details rarely change.

### Query Performance

**Optimization Strategies:**

1. **Pagination:** Fetch returns in pages of 10-20
2. **Field Selection:** Only query fields needed for UI
3. **Parallel Queries:** Fetch order + returns simultaneously when possible
4. **Lazy Loading:** Load return details only when user clicks into specific return

## Data Validation Rules

### Return Eligibility

```typescript
export function isOrderEligibleForReturn(order: Order): {
  eligible: boolean;
  reason?: string;
} {
  // Must be fulfilled
  if (order.fulfillmentStatus !== 'FULFILLED') {
    return {
      eligible: false,
      reason: 'Order must be fulfilled before requesting a return'
    };
  }

  // Within 30-day window
  const processedDate = new Date(order.processedAt);
  const daysSinceOrder = Math.floor(
    (Date.now() - processedDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceOrder > 30) {
    return {
      eligible: false,
      reason: 'Return window has expired (30 days from order date)'
    };
  }

  return {eligible: true};
}
```

### Line Item Validation

```typescript
export function validateReturnLineItem(
  lineItem: OrderLineItem,
  requestedQuantity: number
): {valid: boolean; error?: string} {
  // Check quantity
  if (requestedQuantity <= 0) {
    return {valid: false, error: 'Quantity must be greater than 0'};
  }

  if (requestedQuantity > lineItem.quantity) {
    return {
      valid: false,
      error: `Cannot return more than ${lineItem.quantity} units`
    };
  }

  // Check if already returned
  const alreadyReturned = lineItem.returnedQuantity || 0;
  const availableToReturn = lineItem.quantity - alreadyReturned;

  if (requestedQuantity > availableToReturn) {
    return {
      valid: false,
      error: `Only ${availableToReturn} units available to return`
    };
  }

  return {valid: true};
}
```

## Email Notifications

### Email Triggers

| Event | Recipient | Template |
|-------|-----------|----------|
| Return requested | Customer | "Return request received" |
| Return approved | Customer | "Return approved - ship items back" |
| Return declined | Customer | "Return declined" + reason |
| Refund processed | Customer | "Refund processed" + amount |

### Email Data Requirements

Each email needs:
- Customer name and email
- Order number
- Return number
- Items being returned
- Status/reason
- Next steps

**Implementation:** Use Shopify's built-in email notifications or integrate with email service (Resend, SendGrid) via webhooks.

## Security Considerations

### Authorization

**Customer Account API:**
- Automatically scoped to authenticated customer
- Customers can only view/create their own returns
- No additional authorization needed

**Admin API:**
- Requires admin access token
- Only used server-side (never exposed to client)
- Scoped to `write_returns` and `write_refunds` permissions

### Data Privacy

- Return reasons and notes may contain sensitive information
- Never log customer notes in plain text
- Comply with GDPR/privacy regulations for return data retention

## Migration & Rollout

### Phase 1: Read-Only (Week 1)

- Implement return history page (`/account/returns`)
- Display existing returns (if any)
- No create functionality yet

### Phase 2: Return Requests (Week 2)

- Add "Request Return" button to order details
- Implement return request form
- Submit returns via Customer Account API

### Phase 3: Admin Integration (Week 3)

- Set up webhooks for status updates
- Implement email notifications
- Test full return → refund flow

### Phase 4: Polish (Week 4)

- Add return tracking timeline UI
- Optimize query performance
- Add analytics tracking

## Monitoring & Analytics

### Key Metrics to Track

1. **Return Rate:** `(Returns / Orders) * 100`
2. **Return Reasons:** Distribution of return reasons
3. **Time to Refund:** Days from request to refund
4. **Decline Rate:** `(Declined Returns / Total Returns) * 100`

### Logging

Log these events for debugging:
- Return request submissions (success/failure)
- API errors from Shopify
- Webhook processing
- Email delivery status

## Appendix: Shopify API Versions

This design is based on:
- **Customer Account API:** 2024-10 (latest stable)
- **Admin API:** 2024-10 (latest stable)

**Version Compatibility:** Shopify maintains API versions for 12 months. Update API version annually to access new features and improvements.

## References

- [Shopify Customer Account API - Returns](https://shopify.dev/docs/api/customer)
- [Shopify Admin API - Return Object](https://shopify.dev/docs/api/admin-graphql/latest/objects/Return)
- [Shopify Admin API - Refund Object](https://shopify.dev/docs/api/admin-graphql/latest/objects/Refund)
- [Shopify Webhooks - Returns](https://shopify.dev/docs/api/admin-rest/latest/resources/webhook#event-topics)
