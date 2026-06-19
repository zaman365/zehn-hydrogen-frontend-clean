# Return Management System (RMS) - Complete Architecture Design

## Executive Summary

This document outlines the complete backend and frontend architecture for a self-service Return Management System integrated into the ZEHN e-commerce Hydrogen storefront. The system leverages Shopify as the single source of truth, using the Customer Account API for customer-facing operations and Admin API for staff workflows.

## 1. System Architecture Overview

### 1.1 Architecture Principles

- **Shopify as Single Source of Truth**: No custom database; all return data stored in Shopify
- **API-First Design**: Remix loaders/actions handle all data operations
- **Progressive Enhancement**: Forms work without JavaScript
- **Type Safety**: Full TypeScript coverage with generated types from GraphQL schemas
- **Optimistic UI**: Immediate feedback with background synchronization

### 1.2 Technology Stack

**Frontend:**
- React 18.3.1 with Remix/React Router 7.12.0
- Shopify Hydrogen 2025.10.1
- TailwindCSS 3.4.19
- Lucide React icons
- Sonner for toast notifications

**Backend:**
- Remix Server Actions (Cloudflare Workers)
- Shopify Customer Account API (GraphQL)
- Shopify Admin API (GraphQL, server-side only)
- Shopify Webhooks for real-time updates

**Email:**
- Resend API (already integrated)

## 2. Backend Architecture

### 2.1 Route Structure

```
app/routes/
├── account.returns._index.tsx              # Returns list page
├── account.returns.$id.tsx                  # Return detail page
├── account.returns.create.$orderId.tsx      # Create return form
├── api.returns.validate.tsx                 # Validation endpoint
└── webhooks.returns.$action.tsx             # Webhook handler
```

### 2.2 Service Layer

**Files to create:**
- `/app/lib/returns/validation.ts` - Return eligibility validation
- `/app/lib/returns/shopify-client.ts` - Shopify API wrappers
- `/app/lib/returns/email-notifications.ts` - Email templates
- `/app/lib/returns/types.ts` - TypeScript interfaces

### 2.3 API Endpoints

**Customer-Facing (Customer Account API):**
- `GET /account/returns` - List customer returns
- `GET /account/returns/:id` - Get return details
- `POST /account/returns/create/:orderId` - Submit return request
- `POST /api/returns/validate` - Validate order eligibility

**Admin-Facing (Admin API - server-side only):**
- Approve/decline returns via Shopify Admin
- Process refunds via Shopify Admin
- No custom admin UI needed initially

### 2.4 Webhook Handlers

```
POST /webhooks/returns/approve
POST /webhooks/returns/decline
POST /webhooks/returns/close
POST /webhooks/refunds/create
```

## 3. Frontend Architecture

### 3.1 Component Hierarchy

```
Pages (Routes):
├── account.returns._index.tsx
│   └── ReturnsList component
│       ├── ReturnCard (for each return)
│       └── EmptyState (no returns)
│
├── account.returns.$id.tsx
│   └── ReturnDetail component
│       ├── ReturnStatusTimeline
│       ├── ReturnItemsList
│       └── RefundInformation
│
└── account.returns.create.$orderId.tsx
    └── ReturnRequestForm component
        ├── OrderSummary
        ├── ItemSelector (checkboxes)
        ├── ReasonSelector (dropdown per item)
        ├── PhotoUpload (optional)
        └── SubmitButton
```

### 3.2 Reusable Components

**Files to create:**
- `/app/components/returns/ReturnCard.tsx` - Return summary card
- `/app/components/returns/ReturnStatusBadge.tsx` - Status indicator
- `/app/components/returns/ReturnStatusTimeline.tsx` - Progress tracker
- `/app/components/returns/ReturnItemSelector.tsx` - Item selection UI
- `/app/components/returns/ReturnReasonSelect.tsx` - Reason dropdown
- `/app/components/returns/PhotoUpload.tsx` - Image upload component

### 3.3 State Management

**Form State:**
- Use Remix's native form handling with `useActionData` and `useNavigation`
- No external state management library needed

**Data Fetching:**
- Remix loaders for SSR data fetching
- Optimistic UI updates using `useFetcher` for mutations

### 3.4 Routing

**New Routes:**
- `/account/returns` - Returns history
- `/account/returns/:id` - Return detail
- `/account/returns/create/:orderId` - Create return

**Modified Routes:**
- `/account/orders/:id` - Add "Request Return" button

## 4. Data Flow Diagrams

### 4.1 Return Request Flow

```
Customer → Return Form → Remix Action → Validation → Shopify API → Return Created
                                                                          ↓
Customer ← Email Notification ← Webhook Handler ← Shopify Webhook ←─────┘
```

### 4.2 Return Approval Flow

```
Admin → Shopify Admin → Approve Return → Shopify API → Status Updated
                                                              ↓
Customer ← Email Notification ← Webhook Handler ← Webhook ←─┘
```

### 4.3 Refund Processing Flow

```
Admin → Shopify Admin → Process Refund → Shopify API → Refund Created
                                                              ↓
Customer ← Email Notification ← Webhook Handler ← Webhook ←─┘
```

## 5. Cross-Cutting Concerns

### 5.1 Error Handling

**Shopify API Errors:**
- Network errors → Retry with exponential backoff
- Validation errors → Display user-friendly messages
- Rate limit errors → Queue and retry

**User-Facing Error Messages:**
```typescript
const ERROR_MESSAGES = {
  OUTSIDE_RETURN_WINDOW: 'Die Rückgabefrist von 30 Tagen ist abgelaufen',
  ORDER_NOT_FULFILLED: 'Die Bestellung wurde noch nicht versandt',
  ALREADY_RETURNED: 'Dieser Artikel wurde bereits zurückgegeben',
  INVALID_QUANTITY: 'Ungültige Menge ausgewählt',
  NETWORK_ERROR: 'Verbindungsfehler. Bitte versuchen Sie es erneut',
};
```

### 5.2 Security Considerations

**Authentication:**
- Customer Account API automatically scoped to logged-in customer
- Admin API access token stored server-side only (never exposed to client)

**Authorization:**
- Customers can only view/create their own returns
- Admin operations require server-side validation

**Input Validation:**
- Validate return quantities (must be ≤ available quantity)
- Validate return reasons (must be valid enum value)
- Sanitize customer notes (prevent XSS)

**CSRF Protection:**
- Remix provides built-in CSRF protection via form tokens

### 5.3 Performance Optimization

**Caching Strategy:**
- No local caching - always fetch fresh data from Shopify
- Use Remix's built-in loader caching for page loads

**Image Optimization:**
- Use Shopify CDN URLs for product images
- Lazy load images in return history list

**Bundle Size:**
- Code-split return components (loaded only when needed)
- Use dynamic imports for photo upload component

### 5.4 Risk Assessment

**Technical Risks:**

1. **Shopify API Rate Limits**
   - Risk: High traffic could hit rate limits
   - Mitigation: Implement request queuing and exponential backoff

2. **Webhook Reliability**
   - Risk: Webhooks may fail or arrive out of order
   - Mitigation: Implement idempotent webhook handlers with retry logic

3. **Data Consistency**
   - Risk: Race conditions between customer actions and admin actions
   - Mitigation: Use Shopify's optimistic locking (version fields)

4. **Email Delivery**
   - Risk: Emails may not be delivered
   - Mitigation: Log all email attempts, provide in-app notifications as backup

**Business Risks:**

1. **Return Abuse**
   - Risk: Customers may abuse 30-day return policy
   - Mitigation: Track return patterns, flag suspicious activity (future phase)

2. **Inventory Management**
   - Risk: Returned items not properly restocked
   - Mitigation: Rely on Shopify's built-in inventory management

## 6. Integration Points

### 6.1 Existing Order Pages

**Modify: `/app/routes/account.orders.$id.tsx`**

Add "Request Return" button:
```typescript
{isEligibleForReturn && (
  <Link
    to={`/account/returns/create/${order.id}`}
    className="btn-primary"
  >
    Rücksendung anfordern
  </Link>
)}
```

### 6.2 Account Navigation

**Modify: Account navigation component**

Add returns link:
```typescript
<NavLink to="/account/returns">
  Meine Rücksendungen
</NavLink>
```

### 6.3 Email Notifications

**Email Templates to Create:**
- Return request received
- Return approved
- Return declined (with reason)
- Refund processed
- Exchange shipped

**Integration with Resend API:**
```typescript
// app/lib/returns/email-notifications.ts
import {Resend} from 'resend';

export async function sendReturnRequestEmail(
  customerEmail: string,
  returnData: Return
) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  await resend.emails.send({
    from: 'ZEHN <noreply@zehnfashion.de>',
    to: customerEmail,
    subject: `Rücksendung ${returnData.name} erhalten`,
    html: renderReturnRequestTemplate(returnData),
  });
}
```

## 7. Implementation Phases

### Phase 1: Read-Only (Week 1)
- Implement return history page
- Implement return detail page
- Display existing returns from Shopify

### Phase 2: Return Requests (Week 2)
- Implement return request form
- Implement eligibility validation
- Integrate with Customer Account API

### Phase 3: Admin Integration (Week 3)
- Implement webhook handlers
- Implement email notifications
- Test admin approval workflow

### Phase 4: Polish & Testing (Week 4)
- Add photo upload
- Implement optimistic UI updates
- Comprehensive testing
- Performance optimization

## 8. Monitoring & Observability

**Metrics to Track:**
- Return request success rate
- Average time to approval
- Refund processing time
- API error rates
- Webhook delivery success rate

**Logging:**
- Log all Shopify API calls
- Log all webhook events
- Log all email notifications
- Log validation failures

## 9. Testing Strategy

**Unit Tests:**
- Validation logic
- Eligibility calculations
- Email template rendering

**Integration Tests:**
- Shopify API integration
- Webhook handlers
- Email delivery

**E2E Tests:**
- Complete return request flow
- Return status tracking
- Error handling scenarios

## Conclusion

This architecture provides a complete, production-ready Return Management System that:
- Leverages Shopify's native return infrastructure
- Provides excellent customer experience with self-service
- Reduces manual work for support staff
- Maintains data consistency and security
- Scales with the business

The phased implementation approach allows for incremental delivery and validation at each stage.
