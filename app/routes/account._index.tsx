import {redirect, useLoaderData, Link, Form} from 'react-router';
import type {Route} from './+types/account._index';

const CUSTOMER_DETAILS_QUERY = `#graphql
  query CustomerDetails {
    customer {
      firstName
      lastName
      emailAddress {
        emailAddress
      }
      orders(first: 10, sortKey: CREATED_AT, reverse: true) {
        nodes {
          id
          number
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
          lineItems(first: 2) {
            nodes {
              title
              quantity
            }
          }
        }
      }
    }
  }
` as const;

export async function loader({context}: Route.LoaderArgs) {
  if (!(await context.customerAccount.isLoggedIn())) {
    return redirect('/account/login');
  }

  const {data, errors} = await context.customerAccount.query(
    CUSTOMER_DETAILS_QUERY,
  );

  if (errors?.length || !data?.customer) {
    throw new Error('Failed to load account details');
  }

  return {customer: data.customer};
}

export default function Account() {
  const {customer} = useLoaderData<typeof loader>();
  const {firstName, emailAddress, orders} = customer;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-sans text-3xl font-semibold text-foreground tracking-tight">
              Hallo, {firstName || 'Willkommen'}
            </h1>
            <p className="text-foreground/60 font-sans mt-1">
              {emailAddress?.emailAddress}
            </p>
          </div>
          <Form method="post" action="/account/logout">
            <button
              type="submit"
              className="font-sans text-sm text-foreground/60 hover:text-foreground border border-foreground/20 hover:border-foreground/40 px-4 py-2 rounded-full transition-colors"
            >
              Abmelden
            </button>
          </Form>
        </div>

        {/* Orders */}
        <section>
          <h2 className="font-sans text-xl font-semibold text-foreground mb-6 pb-3 border-b border-border/50">
            Meine Bestellungen
          </h2>

          {orders.nodes.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-foreground/60 font-sans mb-4">
                Noch keine Bestellungen vorhanden.
              </p>
              <Link
                to="/collections/all"
                className="inline-block bg-primary text-primary-foreground font-sans px-6 py-3 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Jetzt einkaufen
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.nodes.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

type Order = {
  id: string;
  number: number;
  processedAt: string;
  financialStatus?: string | null;
  fulfillmentStatus?: string | null;
  totalPrice: {amount: string; currencyCode: string};
  lineItems: {nodes: Array<{title: string; quantity: number}>};
};

function OrderCard({order}: {order: Order}) {
  const date = new Date(order.processedAt).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const itemSummary = order.lineItems.nodes
    .map((item) => `${item.title} ×${item.quantity}`)
    .join(', ');

  return (
    <Link
      to={`/account/orders/${btoa(order.id)}`}
      className="block border border-border/50 rounded-xl p-5 bg-card hover:border-border transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-sans font-semibold text-foreground">
              Bestellung #{order.number}
            </span>
            <FulfillmentBadge status={order.fulfillmentStatus} />
          </div>
          <p className="text-sm text-foreground/60 font-sans mb-2">{date}</p>
          {itemSummary && (
            <p className="text-sm text-foreground/70 font-sans truncate">
              {itemSummary}
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <span className="font-sans font-semibold text-foreground">
            {Number(order.totalPrice.amount).toFixed(2)}{' '}
            {order.totalPrice.currencyCode}
          </span>
        </div>
      </div>
    </Link>
  );
}

function FulfillmentBadge({status}: {status?: string | null}) {
  const safeStatus = status ?? 'OPEN';
  const map: Record<string, {label: string; className: string}> = {
    FULFILLED: {
      label: 'Versendet',
      className: 'bg-green-500/10 text-green-600',
    },
    IN_PROGRESS: {
      label: 'In Bearbeitung',
      className: 'bg-blue-500/10 text-blue-600',
    },
    ON_HOLD: {
      label: 'Zurückgestellt',
      className: 'bg-yellow-500/10 text-yellow-600',
    },
    OPEN: {
      label: 'Offen',
      className: 'bg-foreground/10 text-foreground/70',
    },
    PARTIALLY_FULFILLED: {
      label: 'Teilweise versendet',
      className: 'bg-blue-500/10 text-blue-600',
    },
    PENDING_FULFILLMENT: {
      label: 'Ausstehend',
      className: 'bg-yellow-500/10 text-yellow-600',
    },
    UNFULFILLED: {
      label: 'Nicht versendet',
      className: 'bg-foreground/10 text-foreground/70',
    },
  };

  const badge = map[safeStatus] ?? {
    label: safeStatus,
    className: 'bg-foreground/10 text-foreground/70',
  };

  return (
    <span
      className={`font-sans text-xs px-2 py-0.5 rounded-full font-medium ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}
