import {
  useCallback,
  useMemo,
  useState,
  Suspense,
  useEffect,
  useRef,
} from 'react';
import {Link, useLocation, useRouteLoaderData, Await} from 'react-router';
import type {HeaderQuery} from 'storefrontapi.generated';
import {
  Menu,
  X,
  ShoppingBag,
  Search,
  User,
  Heart,
  ChevronDown,
} from 'lucide-react';
import {CartDrawer} from './CartDrawer';
import {SearchModal} from './SearchModal';
import {useWishlist} from '~/components/zehn/wishlist-context';
import type {RootLoader} from '~/root';
import {
  getCategoryLabel,
  getCollectionRootSlug,
  MAIN_CATEGORY_MAP,
} from '~/lib/category-map';

const FALLBACK_HEADER_MENU: NonNullable<HeaderQuery['menu']> = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Shop All',
      type: 'HTTP',
      url: '/collections/all',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: null,
      tags: [],
      title: 'NEUHEITEN',
      type: 'HTTP',
      url: '/collections/neuheiten',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Bestseller',
      type: 'HTTP',
      url: '/collections/bestseller',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Sale',
      type: 'HTTP',
      url: '/collections/sale',
      items: [],
    },
  ],
};

export type ZehnHeaderMenuProps = {
  menu: HeaderQuery['menu'];
  primaryDomainUrl: HeaderQuery['shop']['primaryDomain']['url'];
  publicStoreDomain: string;
};

export type ZehnHeaderMenuItem = MenuEntry;

export type ZehnHeaderNormalizedLink = {
  title: string;
  url: string;
  isExternal: boolean;
  items: ZehnHeaderNormalizedLink[];
};

type MenuItem = NonNullable<HeaderQuery['menu']>['items'][number];
type MenuEntry = MenuItem | {title: string; url: string; items?: MenuEntry[]};
type CategoryMenuLink = {title: string; handle: string};
type CategoryMenuSection = CategoryMenuLink & {items: CategoryMenuLink[]};

// Build category menu sections from the canonical mapping to ensure links
// and labels are consistent across the app.
const CATEGORY_MENU_SECTIONS: CategoryMenuSection[] = Object.keys(
  MAIN_CATEGORY_MAP,
).map((main) => ({
  title: getCategoryLabel(main),
  handle: main,
  items: (MAIN_CATEGORY_MAP[main] ?? []).map((sub) => ({
    title: getCategoryLabel(sub),
    handle: sub,
  })),
}));

const DESIRED_URL_ORDER = [
  '/collections/all',
  '/collections/neuheiten',
  '/collections/new-arrival',
  '/collections/bestseller',
  '/collections/sale',
];

const TITLE_OVERRIDES: Record<string, string> = {
  '/collections/all': 'Shop All',
  '/collections/neuheiten': 'NEUHEITEN',
  '/collections/new-arrival': 'NEUHEITEN',
};

const isExternalUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

const normalizeMenuUrl = ({
  url,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  url: string | null | undefined;
  primaryDomainUrl?: string;
  publicStoreDomain?: string;
}): string | null => {
  if (!url) return null;

  const isExternal = isExternalUrl(url);
  if (isExternal) return url;

  const cleanUrl = url.startsWith('/')
    ? url
    : url
        .replace(primaryDomainUrl || '', '')
        .replace(publicStoreDomain || '', '');

  return cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
};

const isShopAllMenuItem = ({
  item,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  item: MenuEntry;
  primaryDomainUrl?: string;
  publicStoreDomain?: string;
}) => {
  const url = normalizeMenuUrl({
    url: 'url' in item ? item.url : '',
    primaryDomainUrl,
    publicStoreDomain,
  });

  return url === '/collections/all';
};

function CategoryMenuPanel({
  id,
  className,
  onNavigate,
  showHeading = false,
  headingTitle = 'Shop All',
  shopAllUrl = '/collections/all',
  rootSourceUrl,
  idPrefix = 'category-section',
}: {
  id?: string;
  className: string;
  onNavigate?: () => void;
  showHeading?: boolean;
  headingTitle?: string;
  shopAllUrl?: string;
  rootSourceUrl?: string;
  idPrefix?: string;
}) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const {pathname} = useLocation();
  const rootSlug = getCollectionRootSlug(rootSourceUrl ?? pathname);

  return (
    <nav id={id} className={className} aria-label="Kategorien">
      {showHeading && (
        <Link
          to={shopAllUrl}
          prefetch="intent"
          onClick={onNavigate}
          className="mb-4 flex min-h-[36px] items-center text-[12px] font-semibold uppercase tracking-[0.3em] text-accent underline decoration-1 underline-offset-4 transition-opacity hover:opacity-70"
        >
          {headingTitle}
        </Link>
      )}
      {CATEGORY_MENU_SECTIONS.map((section) => {
        const sectionId = `${idPrefix}-${section.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')}`;
        const isOpen = openSection === section.title;

        return (
          <div key={section.title} className="py-[5px] first:pt-0 last:pb-0">
            <button
              type="button"
              onClick={() =>
                setOpenSection((current) =>
                  current === section.title ? null : section.title,
                )
              }
              className={`flex min-h-[36px] w-full items-center justify-between gap-3 text-left text-[12px] font-semibold uppercase tracking-[0.28em] transition-colors hover:text-accent ${
                isOpen
                  ? 'text-accent underline decoration-1 underline-offset-4'
                  : 'text-foreground'
              }`}
              aria-expanded={isOpen}
              aria-controls={sectionId}
            >
              <span>{section.title}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>
            {
              <div
                id={sectionId}
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                  isOpen
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="mt-2 flex flex-col gap-1.5 border-l border-foreground/10 pl-3">
                    <Link
                      to={`/collections/${rootSlug}/alle-${section.handle}`}
                      prefetch="intent"
                      onClick={onNavigate}
                      className="block text-[12px] font-medium uppercase tracking-[0.18em] text-foreground/80 transition-colors hover:text-foreground"
                    >
                      Alle {section.title}
                    </Link>
                    {section.items.map((item) => (
                      <Link
                        key={`${section.title}-${item.title}`}
                        to={`/collections/${rootSlug}/alle-${section.handle}/${item.handle}`}
                        prefetch="intent"
                        onClick={onNavigate}
                        className="block text-[12px] font-medium uppercase tracking-[0.18em] text-foreground/60 transition-colors hover:text-foreground"
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            }
          </div>
        );
      })}
    </nav>
  );
}

function MobileCollectionMenuSection({
  item,
  isOpen,
  onToggle,
  onNavigate,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  item: MenuEntry;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  primaryDomainUrl?: string;
  publicStoreDomain?: string;
}) {
  const url = normalizeMenuUrl({
    url: 'url' in item ? item.url : '',
    primaryDomainUrl,
    publicStoreDomain,
  });

  if (!url) return null;

  const sectionKey = url
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase();
  const sectionId = `zehn-mobile-${sectionKey || 'collection'}-categories`;

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-[44px] w-full items-center justify-between gap-3 text-left text-xs uppercase tracking-[0.3em] text-foreground/70 transition-all duration-[400ms] ease-out hover:text-foreground"
        aria-expanded={isOpen}
        aria-controls={sectionId}
      >
        <span>{item.title}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>
      <div
        id={sectionId}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          {isOpen && (
            <CategoryMenuPanel
              key={`${sectionKey}-category-menu`}
              onNavigate={onNavigate}
              rootSourceUrl={url}
              idPrefix={`mobile-${sectionKey}-category-section`}
              className="mt-2 flex flex-col gap-1 pl-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}

const buildNormalizedMenu = ({
  items,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  items: MenuEntry[];
  primaryDomainUrl?: string;
  publicStoreDomain?: string;
}): ZehnHeaderNormalizedLink[] =>
  items
    .map((item) => {
      const url = normalizeMenuUrl({
        url: 'url' in item ? item.url : '',
        primaryDomainUrl,
        publicStoreDomain,
      });

      if (!url) return null;

      // Extract child items with proper type handling
      let childItems: MenuEntry[] = [];
      if ('items' in item && Array.isArray(item.items)) {
        childItems = item.items as MenuEntry[];
      }

      return {
        title: item.title,
        url,
        isExternal: isExternalUrl(url),
        items: childItems.length
          ? buildNormalizedMenu({
              items: childItems,
              primaryDomainUrl,
              publicStoreDomain,
            })
          : [],
      };
    })
    .filter((item): item is ZehnHeaderNormalizedLink => Boolean(item));

export const normalizeZehnMenuItems = ({
  items,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  items: MenuEntry[];
  primaryDomainUrl?: string;
  publicStoreDomain?: string;
}): ZehnHeaderNormalizedLink[] =>
  buildNormalizedMenu({items, primaryDomainUrl, publicStoreDomain});

export function Header({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: ZehnHeaderMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [desktopCollection, setDesktopCollection] = useState<{
    title: string;
    url: string;
  } | null>(null);
  const [dropdownCenterOffset, setDropdownCenterOffset] = useState<
    number | null
  >(null);
  const [openMobileCollection, setOpenMobileCollection] = useState<
    string | null
  >(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const categoryMenuButtonRef = useRef<HTMLButtonElement>(null);
  const headerNavRef = useRef<HTMLElement>(null);
  const categoryMenuCloseTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const {count: wishlistCount} = useWishlist();

  // Get customer/auth state from root loader
  const rootData = useRouteLoaderData<RootLoader>('root');
  const isLoggedInPromise = rootData ? (rootData as any).isLoggedIn : undefined;

  const menuItems = useMemo(() => {
    const items = (menu ?? FALLBACK_HEADER_MENU).items;

    // Apply title overrides and sort by URL path
    return [...items]
      .map((item) => {
        const url = 'url' in item && item.url ? item.url : '';
        const overrideKey = Object.keys(TITLE_OVERRIDES).find((path) =>
          url.endsWith(path),
        );
        if (overrideKey) {
          return {...item, title: TITLE_OVERRIDES[overrideKey]};
        }
        return item;
      })
      .sort((a, b) => {
        const urlA = 'url' in a && a.url ? a.url : '';
        const urlB = 'url' in b && b.url ? b.url : '';

        const indexA = DESIRED_URL_ORDER.findIndex((path) =>
          urlA.endsWith(path),
        );
        const indexB = DESIRED_URL_ORDER.findIndex((path) =>
          urlB.endsWith(path),
        );

        // If item not in DESIRED_URL_ORDER, put it at the end
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;

        return indexA - indexB;
      });
  }, [menu]);

  const primaryMenuItems = useMemo(
    () =>
      menuItems.filter(
        (item) =>
          !isShopAllMenuItem({item, primaryDomainUrl, publicStoreDomain}),
      ),
    [menuItems, primaryDomainUrl, publicStoreDomain],
  );

  const shopAllMenuItem = useMemo(
    () =>
      menuItems.find((item) =>
        isShopAllMenuItem({item, primaryDomainUrl, publicStoreDomain}),
      ),
    [menuItems, primaryDomainUrl, publicStoreDomain],
  );

  const shopAllMenuUrl = useMemo(() => {
    if (!shopAllMenuItem) return '/collections/all';

    return (
      normalizeMenuUrl({
        url: 'url' in shopAllMenuItem ? shopAllMenuItem.url : '',
        primaryDomainUrl,
        publicStoreDomain,
      }) ?? '/collections/all'
    );
  }, [shopAllMenuItem, primaryDomainUrl, publicStoreDomain]);

  const cancelCategoryMenuClose = useCallback(() => {
    if (categoryMenuCloseTimerRef.current) {
      clearTimeout(categoryMenuCloseTimerRef.current);
      categoryMenuCloseTimerRef.current = null;
    }
  }, []);

  const closeCategoryMenu = useCallback(() => {
    cancelCategoryMenuClose();
    setIsCategoryMenuOpen(false);
    setDesktopCollection(null);
    setDropdownCenterOffset(null);
  }, [cancelCategoryMenuClose]);

  const scheduleCategoryMenuClose = useCallback(() => {
    cancelCategoryMenuClose();
    categoryMenuCloseTimerRef.current = setTimeout(closeCategoryMenu, 150);
  }, [cancelCategoryMenuClose, closeCategoryMenu]);

  const openDesktopCollectionMenu = useCallback(
    (item: MenuEntry, triggerEl?: HTMLElement) => {
      const url = normalizeMenuUrl({
        url: 'url' in item ? item.url : '',
        primaryDomainUrl,
        publicStoreDomain,
      });

      if (!url) return;

      cancelCategoryMenuClose();
      setDesktopCollection({title: item.title, url});
      setIsCategoryMenuOpen(true);

      if (triggerEl && headerNavRef.current) {
        const navRect = headerNavRef.current.getBoundingClientRect();
        const itemRect = triggerEl.getBoundingClientRect();
        setDropdownCenterOffset(
          itemRect.left + itemRect.width / 2 - navRect.left,
        );
      }
    },
    [cancelCategoryMenuClose, primaryDomainUrl, publicStoreDomain],
  );

  // Ensure animation only runs once per page load
  useEffect(() => {
    // Start animation immediately on mount
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  useEffect(
    () => () => {
      cancelCategoryMenuClose();
    },
    [cancelCategoryMenuClose],
  );

  useEffect(() => {
    if (!isCategoryMenuOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && categoryMenuButtonRef.current?.contains(target)) return;
      if (target && categoryMenuRef.current?.contains(target)) return;
      closeCategoryMenu();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeCategoryMenu();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeCategoryMenu, isCategoryMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) {
      setOpenMobileCollection(null);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && mobileMenuButtonRef.current?.contains(target)) return;
      if (target && mobileMenuRef.current?.contains(target)) return;
      setIsMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* 3px breathing gap below announcement bar so navbar card visually floats */}
      <header className="fixed top-[29px] sm:top-[32px] left-0 right-0 z-50 font-sans bg-transparent">
        <nav
          ref={headerNavRef}
          className={`relative w-[97.5%] lg:w-[95%] max-w-[1400px] mx-auto px-2 sm:px-5 lg:px-8 backdrop-blur-md rounded-lg py-0 my-0 bg-white/40 border border-white/30 transition-all duration-600 ease-out ${
            hasAnimated
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 -translate-y-2'
          }`}
          style={{boxShadow: 'rgba(15, 20, 38, 0.12) 0px 10px 50px'}}
          aria-label="Main"
        >
          <div className="flex items-center h-[68px]">
            {/* Mobile: Hamburger menu button */}
            <button
              ref={mobileMenuButtonRef}
              type="button"
              className="relative lg:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-foreground/80 hover:text-foreground transition-all duration-[400ms] ease-out"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="zehn-mobile-menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
              {!isMenuOpen && (
                <MobileMenuActivityDot wishlistCount={wishlistCount} />
              )}
            </button>

            {/* Mobile: Search icon next to menu for balanced spacing */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="lg:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-foreground/70 hover:text-foreground transition-all duration-[400ms] ease-out"
              aria-label="Suche"
            >
              <Search className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
            </button>

            {/* Desktop: Navigation Links (Left) */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              {/* Hamburger — outside hover zone so moving onto it collapses the nav-link dropdown */}
              <button
                ref={categoryMenuButtonRef}
                type="button"
                onClick={() => {
                  if (isCategoryMenuOpen && !desktopCollection) {
                    closeCategoryMenu();
                    return;
                  }
                  cancelCategoryMenuClose();
                  setDesktopCollection(null);
                  setDropdownCenterOffset(null);
                  setIsCategoryMenuOpen(true);
                }}
                onMouseEnter={scheduleCategoryMenuClose}
                className="flex h-11 w-11 items-center justify-center text-foreground/70 transition-all duration-[400ms] ease-out hover:text-foreground"
                aria-label={
                  isCategoryMenuOpen && !desktopCollection
                    ? 'Kategorie-Menü schließen'
                    : 'Kategorie-Menü öffnen'
                }
                aria-expanded={isCategoryMenuOpen && !desktopCollection}
                aria-controls="zehn-desktop-category-menu"
              >
                {isCategoryMenuOpen && !desktopCollection ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>

              {/* Nav links — hover zone: enter cancels close, leave schedules close */}
              <div
                className="flex items-center gap-6 xl:gap-8"
                onMouseEnter={cancelCategoryMenuClose}
                onMouseLeave={scheduleCategoryMenuClose}
              >
                {primaryMenuItems.map((item) => {
                  const url = normalizeMenuUrl({
                    url: 'url' in item ? item.url : '',
                    primaryDomainUrl,
                    publicStoreDomain,
                  });

                  if (!url) return null;

                  const linkClassName =
                    'text-xs tracking-[0.3em] uppercase text-foreground/70 hover:text-foreground transition-all duration-[400ms] ease-out';
                  const sharedProps = {
                    className: linkClassName,
                    onMouseEnter: (e: React.MouseEvent<HTMLElement>) =>
                      openDesktopCollectionMenu(item, e.currentTarget),
                    onFocus: (e: React.FocusEvent<HTMLElement>) =>
                      openDesktopCollectionMenu(item, e.currentTarget),
                    onClick: closeCategoryMenu,
                  };

                  if (isExternalUrl(url)) {
                    return (
                      <a
                        key={item.title}
                        href={url}
                        {...sharedProps}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.title}
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={item.title}
                      to={url}
                      {...sharedProps}
                      prefetch="intent"
                    >
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Desktop: Centered Logo (absolute) */}
            <a
              href="/"
              className="hidden lg:block absolute left-1/2 -translate-x-1/2 z-10"
            >
              <img
                src="/Dark_Blue_Horizontal.png"
                alt="ZEHN"
                translate="no"
                className="h-12 w-auto border-0 rounded-none"
                style={{border: 'none', outline: 'none', borderRadius: '0'}}
              />
            </a>

            {/* Mobile: Centered Logo (absolute positioning for true centering) */}
            <div className="absolute left-1/2 -translate-x-1/2 lg:hidden">
              <a href="/">
                <img
                  src="/Dark_Blue_Horizontal.png"
                  alt="ZEHN"
                  translate="no"
                  className="h-10 w-auto border-0 rounded-none"
                  style={{border: 'none', outline: 'none', borderRadius: '0'}}
                />
              </a>
            </div>

            {/* Spacer - pushes right icons to the end (both mobile and desktop) */}
            <div className="flex-grow" />

            {/* Right: Action Icons */}
            <div className="flex items-center gap-0.5 sm:gap-1 lg:gap-4 ml-0 lg:ml-0">
              {/* Search Icon */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="hidden lg:flex p-2 min-w-[44px] min-h-[44px] items-center justify-center text-foreground/70 hover:text-foreground transition-all duration-[400ms] ease-out"
                aria-label="Suche"
              >
                <Search className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
              </button>

              {/* Account Icon */}
              <Suspense
                fallback={
                  <Link
                    to="/account/login"
                    className="flex p-2 min-w-[44px] min-h-[44px] items-center justify-center text-foreground/70 hover:text-foreground transition-all duration-[400ms] ease-out relative"
                    aria-label="Anmelden"
                    title="Anmelden"
                  >
                    <User className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
                  </Link>
                }
              >
                <Await resolve={isLoggedInPromise}>
                  {(isLoggedIn) => {
                    const accountUrl = isLoggedIn
                      ? '/account'
                      : '/account/login';
                    return (
                      <Link
                        to={accountUrl}
                        className="flex p-2 min-w-[44px] min-h-[44px] items-center justify-center text-foreground/70 hover:text-foreground transition-all duration-[400ms] ease-out relative"
                        aria-label={isLoggedIn ? 'Mein Konto' : 'Anmelden'}
                        title={isLoggedIn ? 'Mein Konto' : 'Anmelden'}
                      >
                        <User className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
                        {/* Optional: Show indicator when logged in */}
                        {isLoggedIn && (
                          <span
                            className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"
                            aria-hidden="true"
                          />
                        )}
                      </Link>
                    );
                  }}
                </Await>
              </Suspense>

              {/* Wishlist Icon - Desktop only, mobile in sidebar */}
              <span className="hidden lg:block">
                <WishlistHeaderIcon />
              </span>

              {/* Cart Icon - Always on desktop, conditional on mobile (only when items in cart) */}
              <MobileCartButton onClick={() => setIsCartOpen(true)} />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div
            id="zehn-desktop-category-menu"
            className={`absolute top-full hidden w-fit max-w-[calc(100%_-_2rem)] transition-all duration-[400ms] ease-out lg:block ${
              isCategoryMenuOpen
                ? 'mt-3 max-h-[75vh] overflow-y-auto opacity-100'
                : 'pointer-events-none mt-0 max-h-0 overflow-hidden opacity-0'
            }`}
            style={{
              left:
                dropdownCenterOffset !== null
                  ? `${dropdownCenterOffset}px`
                  : '0',
              transform:
                dropdownCenterOffset !== null ? 'translateX(-50%)' : 'none',
            }}
            aria-hidden={!isCategoryMenuOpen}
            {...({inert: !isCategoryMenuOpen || undefined} as object)}
            onMouseEnter={cancelCategoryMenuClose}
            onMouseLeave={scheduleCategoryMenuClose}
          >
            <div
              ref={categoryMenuRef}
              className="w-max max-w-full rounded-2xl bg-white/95 p-8"
            >
              <CategoryMenuPanel
                key={desktopCollection?.url ?? 'shop-all'}
                onNavigate={closeCategoryMenu}
                showHeading
                headingTitle={desktopCollection?.title ?? 'Shop All'}
                shopAllUrl={desktopCollection?.url ?? shopAllMenuUrl}
                rootSourceUrl={desktopCollection?.url ?? shopAllMenuUrl}
                idPrefix="desktop-category-section"
                className="flex w-max max-w-full flex-col gap-1"
              />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div
            id="zehn-mobile-menu"
            className={`lg:hidden overflow-hidden transition-all duration-[400ms] ease-out ${
              isMenuOpen ? 'max-h-[75vh] overflow-y-auto pb-4' : 'max-h-0'
            }`}
          >
            <div
              ref={mobileMenuRef}
              className="flex flex-col gap-4 pt-4 border-t border-foreground/10 bg-white/95 px-4 pb-4 rounded-2xl"
            >
              {[shopAllMenuItem, ...primaryMenuItems]
                .filter(Boolean)
                .map((rawItem) => {
                  const item = rawItem as MenuEntry;
                  const itemUrl =
                    normalizeMenuUrl({
                      url: 'url' in item ? item.url : '',
                      primaryDomainUrl,
                      publicStoreDomain,
                    }) ?? item.title;

                  return (
                    <MobileCollectionMenuSection
                      key={item.title}
                      item={item}
                      isOpen={openMobileCollection === itemUrl}
                      onToggle={() =>
                        setOpenMobileCollection((current) =>
                          current === itemUrl ? null : itemUrl,
                        )
                      }
                      onNavigate={() => setIsMenuOpen(false)}
                      primaryDomainUrl={primaryDomainUrl}
                      publicStoreDomain={publicStoreDomain}
                    />
                  );
                })}
              {/* Mobile-only: Wishlist link */}
              <Link
                to="/wishlist"
                className="text-xs tracking-[0.3em] uppercase text-foreground/70 hover:text-foreground transition-all duration-[400ms] ease-out py-2 min-h-[44px] flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="relative mr-3">
                  <Heart
                    className={`w-4 h-4 ${
                      wishlistCount > 0 ? 'fill-accent text-accent' : ''
                    }`}
                  />
                  {wishlistCount > 0 && <CountBadge count={wishlistCount} />}
                </span>
                Wunschliste
              </Link>
              {/* Mobile-only: Cart link */}
              <MobileMenuCartButton
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsCartOpen(true);
                }}
              />
            </div>
          </div>
        </nav>
      </header>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Cart Drawer - Hydrogen Integrated */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

function CountBadge({
  count,
  className = '-top-1.5 -right-1.5',
}: {
  count: number;
  className?: string;
}) {
  const label = count > 9 ? '9+' : String(count);

  return (
    <span
      className={`absolute ${className} h-3 w-3 rounded-full bg-accent text-accent-foreground`}
    >
      <span className="absolute inset-0 flex items-center justify-center text-[8px] font-medium leading-none tracking-normal">
        {label}
      </span>
    </span>
  );
}

function MobileMenuActivityDot({wishlistCount}: {wishlistCount: number}) {
  if (wishlistCount === 0) return null;

  return (
    <span
      className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-accent"
      aria-hidden="true"
    />
  );
}

function MobileMenuCartButton({onClick}: {onClick: () => void}) {
  const data = useRouteLoaderData<RootLoader>('root');
  const cartPromise = data ? (data as any).cart : undefined;

  const renderButton = (count: number) => (
    <button
      type="button"
      className="text-xs tracking-[0.3em] uppercase text-foreground/70 hover:text-foreground transition-all duration-[400ms] ease-out py-2 min-h-[44px] flex items-center gap-2 text-left"
      onClick={onClick}
    >
      <span className="relative mr-3">
        <ShoppingBag className={`w-4 h-4 ${count > 0 ? 'text-accent' : ''}`} />
        {count > 0 && <CountBadge count={count} />}
      </span>
      Warenkorb
    </button>
  );

  return (
    <Suspense fallback={renderButton(0)}>
      <Await resolve={cartPromise}>
        {(cart) => renderButton(cart?.totalQuantity ?? 0)}
      </Await>
    </Suspense>
  );
}

function MobileCartButton({onClick}: {onClick: () => void}) {
  const data = useRouteLoaderData<RootLoader>('root');
  const cartPromise = data ? (data as any).cart : undefined;

  return (
    <Suspense
      fallback={
        <button
          type="button"
          onClick={onClick}
          className="relative flex p-1.5 sm:p-2 min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] items-center justify-center text-foreground/70 hover:text-foreground transition-all duration-[400ms] ease-out"
          aria-label="Warenkorb"
        >
          <ShoppingBag className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
        </button>
      }
    >
      <Await resolve={cartPromise}>
        {(cart) => {
          const count = cart?.totalQuantity ?? 0;
          return (
            <button
              type="button"
              onClick={onClick}
              className="relative flex p-1.5 sm:p-2 min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] items-center justify-center text-foreground/70 hover:text-foreground transition-all duration-[400ms] ease-out"
              aria-label="Warenkorb"
            >
              <span className="relative flex items-center justify-center">
                <ShoppingBag
                  className={`w-[18px] h-[18px] sm:w-5 sm:h-5 ${count > 0 ? 'text-accent' : ''}`}
                />
                {count > 0 && <CountBadge count={count} />}
              </span>
            </button>
          );
        }}
      </Await>
    </Suspense>
  );
}

function WishlistHeaderIcon() {
  const {count} = useWishlist();
  return (
    <Link
      to="/wishlist"
      className="relative p-1.5 sm:p-2 min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center text-foreground/70 hover:text-foreground transition-all duration-[400ms] ease-out"
      aria-label="Wunschliste"
      title="Wunschliste"
    >
      <span className="relative flex items-center justify-center">
        <Heart
          className={`w-[18px] h-[18px] sm:w-5 sm:h-5 ${count > 0 ? 'fill-accent text-accent' : ''}`}
        />
        {count > 0 && <CountBadge count={count} />}
      </span>
    </Link>
  );
}
