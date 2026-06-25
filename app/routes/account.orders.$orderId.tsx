import {redirect, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/account.orders.$orderId';

const ORDER_DETAILS_QUERY = `#graphql
  query OrderDetails($orderId: ID!) {
    order(id: $orderId) {
      id
      name
      number
      processedAt
      financialStatus
      fulfillmentStatus
      totalPrice {
        amount
        currencyCode
      }
      subtotalPrice {
        amount
        currencyCode
      }
      totalShippingPrice {
        amount
        currencyCode
      }
      totalTax {
        amount
        currencyCode
      }
      shippingAddress {
        name
        address1
        address2
        city
        country
        zip
      }
      lineItems(first: 100) {
        nodes {
          title
          quantity
          price {
            amount
            currencyCode
          }
          image {
            url
            altText
            width
            height
          }
          discountedTotalPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
` as const;

export async function loader({params, context}: Route.LoaderArgs) {
  if (!(await context.customerAccount.isLoggedIn())) {
    return redirect('/account/login');
  }

  const {orderId} = params;
  if (!orderId) return redirect('/account');

  const decodedId = atob(orderId);

  const {data, errors} = await context.customerAccount.query(
    ORDER_DETAILS_QUERY,
    {variables: {orderId: decodedId}},
  );

  if (errors?.length || !data?.order) {
    throw new Error('Bestellung nicht gefunden');
  }

  return {order: data.order};
}

export default function OrderDetails() {
  const {order} = useLoaderData<typeof loader>();

  const date = new Date(order.processedAt).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const fmt = (amount: string, currency: string) =>
    `${Number(amount).toFixed(2)} ${currency}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link
            to="/account"
            className="font-sans text-sm text-foreground/60 hover:text-foreground transition-colors"
          >
            ← Zurück zum Konto
          </Link>
        </div>

        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="font-sans text-3xl font-semibold text-foreground tracking-tight">
              Bestellung {order.name}
            </h1>
            <p className="text-foreground/60 font-sans mt-1">{date}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <FulfillmentBadge status={order.fulfillmentStatus} />
            <FinancialBadge status={order.financialStatus} />
          </div>
        </div>

        {/* Line items */}
        <section className="mb-8">
          <h2 className="font-sans text-lg font-semibold text-foreground mb-4 pb-3 border-b border-border/50">
            Artikel
          </h2>
          <div className="space-y-4">
            {order.lineItems.nodes.map(
              (item: LineItem) => (
                <div
                  key={`${item.title}-${item.quantity}-${item.price.amount}`}
                  className="flex gap-4 p-4 border border-border/50 rounded-xl bg-card"
                >
                  {item.image && (
                    <img
                      src={item.image.url}
                      alt={item.image.altText ?? item.title}
                      width={72}
                      height={72}
                      className="rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-medium text-foreground">
                      {item.title}
                    </p>
                    <p className="font-sans text-sm text-foreground/60 mt-0.5">
                      Menge: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-sans font-semibold text-foreground">
                      {fmt(
                        item.discountedTotalPrice?.amount ?? item.price.amount,
                        item.price.currencyCode,
                      )}
                    </p>
                    {item.discountedTotalPrice &&
                      item.discountedTotalPrice.amount !== item.price.amount && (
                        <p className="font-sans text-sm text-foreground/50 line-through mt-0.5">
                          {fmt(item.price.amount, item.price.currencyCode)}
                        </p>
                      )}
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Shipping address */}
          {order.shippingAddress && (
            <section className="border border-border/50 rounded-xl p-5 bg-card">
              <h2 className="font-sans text-base font-semibold text-foreground mb-3">
                Lieferadresse
              </h2>
              <address className="not-italic font-sans text-sm text-foreground/70 space-y-0.5">
                {order.shippingAddress.name && (
                  <p>{order.shippingAddress.name}</p>
                )}
                {order.shippingAddress.address1 && (
                  <p>{order.shippingAddress.address1}</p>
                )}
                {order.shippingAddress.address2 && (
                  <p>{order.shippingAddress.address2}</p>
                )}
                <p>
                  {order.shippingAddress.zip} {order.shippingAddress.city}
                </p>
                {order.shippingAddress.country && (
                  <p>{order.shippingAddress.country}</p>
                )}
              </address>
            </section>
          )}

          {/* Price summary */}
          <section className="border border-border/50 rounded-xl p-5 bg-card">
            <h2 className="font-sans text-base font-semibold text-foreground mb-3">
              Zusammenfassung
            </h2>
            <div className="space-y-2 font-sans text-sm">
              {order.subtotalPrice && (
                <div className="flex justify-between text-foreground/70">
                  <span>Zwischensumme</span>
                  <span>
                    {fmt(
                      order.subtotalPrice.amount,
                      order.subtotalPrice.currencyCode,
                    )}
                  </span>
                </div>
              )}
              {order.totalShippingPrice && (
                <div className="flex justify-between text-foreground/70">
                  <span>Versand</span>
                  <span>
                    {Number(order.totalShippingPrice.amount) === 0
                      ? 'Kostenlos'
                      : fmt(
                          order.totalShippingPrice.amount,
                          order.totalShippingPrice.currencyCode,
                        )}
                  </span>
                </div>
              )}
              {order.totalTax && Number(order.totalTax.amount) > 0 && (
                <div className="flex justify-between text-foreground/70">
                  <span>Steuern</span>
                  <span>
                    {fmt(order.totalTax.amount, order.totalTax.currencyCode)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-foreground pt-2 border-t border-border/50">
                <span>Gesamt</span>
                <span>
                  {fmt(order.totalPrice.amount, order.totalPrice.currencyCode)}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

type LineItem = {
  title: string;
  quantity: number;
  price: {amount: string; currencyCode: string};
  image?: {url: string; altText?: string; width?: number; height?: number} | null;
  discountedTotalPrice?: {amount: string; currencyCode: string} | null;
};

function FulfillmentBadge({status}: {status: string}) {
  const map: Record<string, {label: string; className: string}> = {
    FULFILLED: {label: 'Versendet', className: 'bg-green-500/10 text-green-600'},
    IN_PROGRESS: {
      label: 'In Bearbeitung',
      className: 'bg-blue-500/10 text-blue-600',
    },
    ON_HOLD: {
      label: 'Zurückgestellt',
      className: 'bg-yellow-500/10 text-yellow-600',
    },
    OPEN: {label: 'Offen', className: 'bg-foreground/10 text-foreground/70'},
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

  const badge = map[status] ?? {
    label: status,
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

function FinancialBadge({status}: {status: string}) {
  const map: Record<string, {label: string; className: string}> = {
    PAID: {label: 'Bezahlt', className: 'bg-green-500/10 text-green-600'},
    PENDING: {
      label: 'Ausstehend',
      className: 'bg-yellow-500/10 text-yellow-600',
    },
    REFUNDED: {
      label: 'Erstattet',
      className: 'bg-foreground/10 text-foreground/70',
    },
    PARTIALLY_REFUNDED: {
      label: 'Teilweise erstattet',
      className: 'bg-blue-500/10 text-blue-600',
    },
    VOIDED: {
      label: 'Storniert',
      className: 'bg-red-500/10 text-red-600',
    },
  };

  const badge = map[status] ?? {
    label: status,
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
