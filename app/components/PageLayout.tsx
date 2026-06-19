import {Await, Link} from 'react-router';
import {Suspense, useId} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {
  transformNavbarCollections,
  type NavbarCollectionsQuery,
  type NavbarLink,
} from '~/lib/queries';
import {Aside} from '~/components/Aside';
import {HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {Header as ZehnHeader} from '~/components/zehn/Header';
import {Footer as ZehnFooter} from '~/components/zehn/Footer';
import {ContactChat} from '~/components/zehn/contact/ContactChat';
import {CookieConsent} from '~/components/zehn/CookieConsent';
import {AnnouncementBar} from '~/components/zehn/AnnouncementBar';
import {WishlistProvider} from '~/components/zehn/wishlist-context';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  navbarCollections: NavbarCollectionsQuery | null;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

const DEFAULT_NAV_ITEMS: NavbarLink[] = [
  {title: 'Bestseller', url: '/collections/bestseller'},
  {title: 'Sale', url: '/collections/sale'},
  {title: 'Alle Produkte', url: '/collections/all'},
  {title: 'NEUHEITEN', url: '/collections/neuheiten'},
];

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  navbarCollections,
  isLoggedIn,
  publicStoreDomain,
}: PageLayoutProps) {
  const navbarLinks = transformNavbarCollections(
    navbarCollections,
    DEFAULT_NAV_ITEMS,
  );

  const navbarMenu = {
    id: 'navbar-menu',
    items: navbarLinks.map((item, index) => ({
      id: `navbar-item-${index}`,
      resourceId: null,
      tags: [],
      title: item.title,
      type: 'HTTP' as const,
      url: item.url,
      items: [],
    })),
  };

  return (
    <WishlistProvider isLoggedInPromise={isLoggedIn}>
      <Aside.Provider>
        <CartAside cart={cart} />
        <SearchAside />
        <MobileMenuAside header={header} publicStoreDomain={publicStoreDomain} />
        <AnnouncementBar />
        <ZehnHeader
          menu={navbarMenu}
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
        <main className="pt-[102px] sm:pt-[106px]">{children}</main>
        <ZehnFooter />
        <ContactChat />
        <CookieConsent />
      </Aside.Provider>
    </WishlistProvider>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  return (
    <Aside type="cart" heading="WARENKORB">
      <Suspense fallback={<p>Warenkorb wird geladen ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  const queriesDatalistId = useId();
  return (
    <Aside type="search" heading="SUCHE">
      <div className="predictive-search">
        <br />
        <SearchFormPredictive>
          {({fetchResults, goToSearch, inputRef}) => (
            <>
              <input
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="Suche"
                ref={inputRef}
                type="search"
                list={queriesDatalistId}
              />
              &nbsp;
              <button onClick={goToSearch}>Suche</button>
            </>
          )}
        </SearchFormPredictive>

        <SearchResultsPredictive>
          {({items, total, term, state, closeSearch}) => {
            const {articles, collections, pages, products, queries} = items;

            if (state === 'loading' && term.current) {
              return <div>Lädt...</div>;
            }

            if (!total) {
              return <SearchResultsPredictive.Empty term={term} />;
            }

            return (
              <>
                <SearchResultsPredictive.Queries
                  queries={queries}
                  queriesDatalistId={queriesDatalistId}
                />
                <SearchResultsPredictive.Products
                  products={products}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Collections
                  collections={collections}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Pages
                  pages={pages}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Articles
                  articles={articles}
                  closeSearch={closeSearch}
                  term={term}
                />
                {term.current && total ? (
                  <Link
                    onClick={closeSearch}
                    to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                  >
                    <p>
                      Alle Ergebnisse anzeigen für <q>{term.current}</q>
                      &nbsp; →
                    </p>
                  </Link>
                ) : null}
              </>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Aside>
  );
}

function MobileMenuAside({
  header,
  publicStoreDomain,
}: {
  header: PageLayoutProps['header'];
  publicStoreDomain: PageLayoutProps['publicStoreDomain'];
}) {
  return (
    header.menu &&
    header.shop.primaryDomain?.url && (
      <Aside type="mobile" heading="MENÜ">
        <HeaderMenu
          menu={header.menu}
          viewport="mobile"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
      </Aside>
    )
  );
}
