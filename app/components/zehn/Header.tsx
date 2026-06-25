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
} from 'lucide-react';
import {CartDrawer} from './CartDrawer';
import {SearchModal} from './SearchModal';
import {CategoryMenuPanel} from './CategoryMenuPanel';
import {DesktopCategoryNavPopover} from './DesktopCategoryNavPopover';
import {HeaderNavCountBadge} from './HeaderNavCountBadge';
import {HeaderNavMobileLabeledRow} from './HeaderNavMobileLabeledRow';
import {HeaderNavAccordionRow} from './HeaderNavAccordionRow';
import {ZehnNavStaggerItem} from './ZehnNavStaggerItem';
import {
  HeaderNavIcon,
  HeaderNavIconButton,
  HeaderNavLink,
} from './HeaderNavItem';
import {useWishlist} from '~/components/zehn/wishlist-context';
import type {RootLoader} from '~/root';
import {
  getCategoryLabel,
  getCollectionRootSlug,
} from '~/lib/category-map';
import {
  HEADER_NAV_ICON_STROKE,
  DESKTOP_SHOP_ALL_NAV_LABEL,
  HEADER_NAV_COUNT_BADGE_RING,
  HEADER_NAV_MOBILE_MENU_MAX_H,
  HEADER_NAV_MOBILE_SUBMENU_INDENT,
} from '~/lib/header-nav-styles';
import {
  ZEHN_NAV_SURFACE,
  ZEHN_SURFACE_GLOW,
} from '~/lib/zehn-surface-styles';
import {isNavPopoverPointerTarget} from '~/lib/header-nav-dropdown-styles';
import {ZEHN_SITE_CONTENT_ROW} from '~/lib/site-content-row';
import {cn} from '~/lib/utils';
import {
  isMobileCatalogAccordionLabelActive,
  isNavCollectionRootActive,
  resolveMobileNavOpenState,
  shouldAutoExpandMobileAccordion,
  type MobileNavOpenState,
} from '~/lib/header-nav-active';
import {
  isCatalogFreshNavUrl,
  toCatalogFreshNav,
} from '~/lib/catalog-band-context';
import {useCatalogChipNav, type CatalogChipNavSnapshot} from '~/components/zehn/catalog-chip-nav-context';
import {
  isMenuAriaExpanded,
  isMenuShellMounted,
  menuPhaseToStagger,
  shouldFreezeMobileAccordion,
  type NavMenuPhase,
} from '~/lib/nav-menu-phase';
import {useScrollLock} from '~/hooks/useScrollLock';
import {useHeaderCartCount} from '~/hooks/useHeaderCartCount';

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

const DESIRED_URL_ORDER = [
  '/collections/all',
  '/collections/neuheiten',
  '/collections/new-arrival',
  '/collections/bestseller',
  '/collections/sale',
];

const TITLE_OVERRIDES: Record<string, string> = {
  '/collections/all': DESKTOP_SHOP_ALL_NAV_LABEL,
  '/collections/neuheiten': 'NEUHEITEN',
  '/collections/new-arrival': 'NEUHEITEN',
};

/** Top navbar catalog titles — land with Alle active (BL-0011 / BL-0017). */
function resolveCatalogNavTo(url: string) {
  return isCatalogFreshNavUrl(url) ? toCatalogFreshNav(url) : url;
}

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

function MobileCollectionMenuSection({
  item,
  isOpen,
  freezeContent = false,
  onToggle,
  onNavigate,
  primaryDomainUrl,
  publicStoreDomain,
  initialOpenSection = null,
}: {
  item: MenuEntry;
  isOpen: boolean;
  /** Keep submenu mounted/expanded during drawer close animation */
  freezeContent?: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  primaryDomainUrl?: string;
  publicStoreDomain?: string;
  initialOpenSection?: string | null;
}) {
  const {pathname} = useLocation();
  const chipSnapshot = useCatalogChipNav();
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
  const showSubmenu = isOpen || freezeContent;

  return (
    <div>
      <HeaderNavAccordionRow
        to={resolveCatalogNavTo(url)}
        label={item.title}
        isOpen={isOpen}
        isRouteActive={isMobileCatalogAccordionLabelActive(
          pathname,
          url,
          chipSnapshot,
          isOpen,
        )}
        onToggle={onToggle}
        onNavigate={onNavigate}
        ariaControls={sectionId}
      />
      <div
        id={sectionId}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          showSubmenu ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          {showSubmenu && (
            <CategoryMenuPanel
              key={`${sectionKey}-category-menu`}
              onNavigate={onNavigate}
              rootSourceUrl={url}
              idPrefix={`mobile-${sectionKey}-category-section`}
              interactionMode="toggleRow"
              initialOpenSection={initialOpenSection}
              className={cn(HEADER_NAV_MOBILE_SUBMENU_INDENT, 'flex flex-col gap-1')}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/** Chip-derived accordion section for desktop hover popover (BL-0017). */
function resolveDesktopCategoryInitialSection(
  itemUrl: string,
  chipSnapshot: CatalogChipNavSnapshot,
): string | null {
  if (chipSnapshot.source === 'idle') return null;
  if (chipSnapshot.rootSlug !== getCollectionRootSlug(itemUrl)) return null;
  if (!chipSnapshot.activeMainCategory) return null;
  return getCategoryLabel(chipSnapshot.activeMainCategory);
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

/** Matches mobile drawer `transition-all duration-[400ms]` collapse. */
const MOBILE_SHELL_COLLAPSE_MS = 400;
/** Faster shell collapse after in-menu navigation — page is already swapping. */
const MOBILE_NAVIGATE_SHELL_COLLAPSE_MS = 200;

export type MobileMenuCloseIntent = 'navigate' | 'dismiss';

export function Header({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: ZehnHeaderMenuProps) {
  const [mobileMenuPhase, setMobileMenuPhase] = useState<NavMenuPhase>('idle');
  const [isMobileMenuShellExpanded, setIsMobileMenuShellExpanded] =
    useState(false);
  const [mobileShellTransitionMs, setMobileShellTransitionMs] = useState(
    MOBILE_SHELL_COLLAPSE_MS,
  );
  const [categoryMenuPhase, setCategoryMenuPhase] =
    useState<NavMenuPhase>('idle');
  const [desktopCollection, setDesktopCollection] = useState<{
    title: string;
    url: string;
  } | null>(null);
  const [openMobileCollection, setOpenMobileCollection] = useState<
    string | null
  >(null);
  const [openMobileSection, setOpenMobileSection] = useState<string | null>(
    null,
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const desktopNavTriggersRef = useRef<HTMLDivElement>(null);
  const categoryMenuCloseTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const categoryMenuCloseFinishedRef = useRef(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuCloseCollapseTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const mobileMenuCloseFinishedRef = useRef(false);
  const wasMenuOpenRef = useRef(false);
  const mobileAccordionHintRef = useRef<MobileNavOpenState>({
    collectionMenuUrl: null,
    sectionTitle: null,
  });
  const {count: wishlistCount} = useWishlist();
  const {pathname} = useLocation();
  const chipSnapshot = useCatalogChipNav();

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

  const mobileNavMenuEntries = useMemo(() => {
    const entries = [shopAllMenuItem, ...primaryMenuItems].filter(Boolean);
    return entries
      .map((item) => {
        const url = normalizeMenuUrl({
          url: 'url' in item ? item.url : '',
          primaryDomainUrl,
          publicStoreDomain,
        });
        return url ? {url} : null;
      })
      .filter((entry): entry is {url: string} => entry !== null);
  }, [shopAllMenuItem, primaryMenuItems, primaryDomainUrl, publicStoreDomain]);

  const mobileStaggerTotal = mobileNavMenuEntries.length + 2;

  const mobileMenuStaggerPhase = menuPhaseToStagger(mobileMenuPhase, 'mobile');
  const desktopStaggerPhase = menuPhaseToStagger(categoryMenuPhase, 'desktop');
  const mobileMenuAriaExpanded = isMenuAriaExpanded(mobileMenuPhase);
  const mobileMenuAccordionFrozen = shouldFreezeMobileAccordion(mobileMenuPhase);

  useScrollLock(isMenuShellMounted(mobileMenuPhase));

  const cancelMobileMenuCloseTimers = useCallback(() => {
    if (mobileMenuCloseCollapseTimerRef.current) {
      clearTimeout(mobileMenuCloseCollapseTimerRef.current);
      mobileMenuCloseCollapseTimerRef.current = null;
    }
  }, []);

  const cancelCategoryMenuClose = useCallback(() => {
    if (categoryMenuCloseTimerRef.current) {
      clearTimeout(categoryMenuCloseTimerRef.current);
      categoryMenuCloseTimerRef.current = null;
    }
  }, []);

  const finishCloseCategoryMenu = useCallback(() => {
    if (categoryMenuCloseFinishedRef.current) return;
    categoryMenuCloseFinishedRef.current = true;
    cancelCategoryMenuClose();
    setCategoryMenuPhase('idle');
    setDesktopCollection(null);
  }, [cancelCategoryMenuClose]);

  const beginCloseCategoryMenu = useCallback(() => {
    setCategoryMenuPhase((phase) => {
      if (phase === 'open') {
        categoryMenuCloseFinishedRef.current = false;
        return 'closing';
      }
      return phase;
    });
  }, []);

  const closeCategoryMenu = useCallback(() => {
    beginCloseCategoryMenu();
  }, [beginCloseCategoryMenu]);

  const scheduleCategoryMenuClose = useCallback(() => {
    cancelCategoryMenuClose();
    categoryMenuCloseTimerRef.current = setTimeout(
      beginCloseCategoryMenu,
      150,
    );
  }, [cancelCategoryMenuClose, beginCloseCategoryMenu]);

  const openDesktopCollectionMenu = useCallback(
    (item: MenuEntry) => {
      const url = normalizeMenuUrl({
        url: 'url' in item ? item.url : '',
        primaryDomainUrl,
        publicStoreDomain,
      });

      if (!url) return;

      cancelCategoryMenuClose();
      categoryMenuCloseFinishedRef.current = false;
      setDesktopCollection({title: item.title, url});
      setCategoryMenuPhase('open');
    },
    [cancelCategoryMenuClose, primaryDomainUrl, publicStoreDomain],
  );

  const openMobileMenu = useCallback(() => {
    cancelMobileMenuCloseTimers();
    mobileMenuCloseFinishedRef.current = false;
    setMobileShellTransitionMs(MOBILE_SHELL_COLLAPSE_MS);
    setIsMobileMenuShellExpanded(true);
    setMobileMenuPhase('open');
    wasMenuOpenRef.current = false;

    const hint = mobileAccordionHintRef.current;
    if (shouldAutoExpandMobileAccordion(pathname)) {
      if (hint.collectionMenuUrl) {
        setOpenMobileCollection(hint.collectionMenuUrl);
      }
      setOpenMobileSection(hint.sectionTitle);
    } else {
      setOpenMobileCollection(null);
      setOpenMobileSection(null);
    }
  }, [cancelMobileMenuCloseTimers, pathname]);

  const finishCloseMobileMenu = useCallback(() => {
    if (mobileMenuCloseFinishedRef.current) return;
    mobileMenuCloseFinishedRef.current = true;
    cancelMobileMenuCloseTimers();
    setMobileMenuPhase('idle');
    setIsMobileMenuShellExpanded(false);
    setOpenMobileCollection(null);
    setOpenMobileSection(null);
  }, [cancelMobileMenuCloseTimers]);

  const beginCloseMobileMenu = useCallback(
    (intent: MobileMenuCloseIntent = 'dismiss') => {
      setMobileMenuPhase((phase) => {
        if (phase !== 'open') return phase;

        mobileMenuCloseFinishedRef.current = false;
        cancelMobileMenuCloseTimers();
        const collapseMs =
          intent === 'navigate'
            ? MOBILE_NAVIGATE_SHELL_COLLAPSE_MS
            : MOBILE_SHELL_COLLAPSE_MS;
        setMobileShellTransitionMs(collapseMs);
        setIsMobileMenuShellExpanded(false);
        mobileMenuCloseCollapseTimerRef.current = setTimeout(() => {
          finishCloseMobileMenu();
          mobileMenuCloseCollapseTimerRef.current = null;
        }, collapseMs);

        return 'closing';
      });
    },
    [cancelMobileMenuCloseTimers, finishCloseMobileMenu],
  );

  const closeMobileMenuOnNavigate = useCallback(() => {
    beginCloseMobileMenu('navigate');
  }, [beginCloseMobileMenu]);

  useEffect(
    () => () => {
      cancelCategoryMenuClose();
      cancelMobileMenuCloseTimers();
    },
    [cancelCategoryMenuClose, cancelMobileMenuCloseTimers],
  );

  useEffect(() => {
    if (categoryMenuPhase !== 'open') return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && desktopNavTriggersRef.current?.contains(target)) return;
      if (isNavPopoverPointerTarget(target)) return;
      beginCloseCategoryMenu();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        beginCloseCategoryMenu();
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
  }, [beginCloseCategoryMenu, categoryMenuPhase]);

  useEffect(() => {
    if (categoryMenuPhase !== 'closing') return;
    const timer = setTimeout(finishCloseCategoryMenu, 380);
    return () => clearTimeout(timer);
  }, [categoryMenuPhase, finishCloseCategoryMenu]);

  /** Chip/pathname hint for manual accordion expand — never opens menu while closed. */
  useEffect(() => {
    mobileAccordionHintRef.current = resolveMobileNavOpenState(
      pathname,
      mobileNavMenuEntries,
      chipSnapshot,
    );
  }, [chipSnapshot, mobileNavMenuEntries, pathname]);

  useEffect(() => {
    if (!isMenuShellMounted(mobileMenuPhase)) {
      wasMenuOpenRef.current = false;
      return;
    }

    if (shouldFreezeMobileAccordion(mobileMenuPhase)) return;

    if (!wasMenuOpenRef.current) {
      wasMenuOpenRef.current = true;
      return;
    }

    const resolved = resolveMobileNavOpenState(
      pathname,
      mobileNavMenuEntries,
      chipSnapshot,
    );

    // After in-menu navigation — align accordion to new catalog root (BL-0011).
    if (resolved.collectionMenuUrl) {
      setOpenMobileCollection(resolved.collectionMenuUrl);
    }
    setOpenMobileSection(resolved.sectionTitle);
  }, [chipSnapshot, mobileMenuPhase, mobileNavMenuEntries, pathname]);

  useEffect(() => {
    if (!isMenuShellMounted(mobileMenuPhase)) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && mobileMenuButtonRef.current?.contains(target)) return;
      if (target && mobileMenuRef.current?.contains(target)) return;
      beginCloseMobileMenu();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        beginCloseMobileMenu();
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
  }, [mobileMenuPhase, beginCloseMobileMenu]);

  return (
    <>
      {/* 3px breathing gap below announcement bar so navbar card visually floats */}
      <header className="fixed top-[29px] sm:top-[32px] left-0 right-0 z-50 font-sans bg-transparent">
        <nav
          /* BL-0006: no entrance animation — nav paints instantly on hard refresh */
          className={cn(
            'relative py-0 my-0',
            ZEHN_SITE_CONTENT_ROW,
            ZEHN_NAV_SURFACE,
            ZEHN_SURFACE_GLOW,
          )}
          aria-label="Main"
        >
          <div className="flex items-center h-[68px]">
            {/* Mobile: Hamburger menu button */}
            <HeaderNavIconButton
              buttonRef={mobileMenuButtonRef}
              className="lg:hidden overflow-visible"
              active={mobileMenuAriaExpanded}
              ariaLabel={mobileMenuAriaExpanded ? 'Close menu' : 'Open menu'}
              ariaExpanded={mobileMenuAriaExpanded}
              ariaControls="zehn-mobile-menu"
              onClick={() => {
                if (mobileMenuAriaExpanded) {
                  beginCloseMobileMenu();
                } else {
                  openMobileMenu();
                }
              }}
            >
              {mobileMenuAriaExpanded ? (
                <HeaderNavIcon icon={X} active={mobileMenuAriaExpanded} />
              ) : (
                <>
                  <HeaderNavIcon icon={Menu} active={mobileMenuAriaExpanded} />
                  {!mobileMenuAriaExpanded && (
                    <MobileMenuActivityDot wishlistCount={wishlistCount} />
                  )}
                </>
              )}
            </HeaderNavIconButton>

            {/* Mobile: Search icon next to menu for balanced spacing */}
            <HeaderNavIconButton
              className="lg:hidden"
              active={isSearchOpen}
              ariaLabel="Suche"
              onClick={() => setIsSearchOpen(true)}
            >
              <HeaderNavIcon icon={Search} active={isSearchOpen} />
            </HeaderNavIconButton>

            {/* Desktop: Alle Produkte + collection nav pills (hover opens category dropdown) */}
            <div
              ref={desktopNavTriggersRef}
              className="hidden lg:flex items-center gap-6 xl:gap-8"
              onMouseEnter={cancelCategoryMenuClose}
              onMouseLeave={scheduleCategoryMenuClose}
            >
              {shopAllMenuItem && (
                <DesktopCategoryNavPopover
                  open={
                    desktopCollection?.url === shopAllMenuUrl &&
                    categoryMenuPhase !== 'idle'
                  }
                  onOpenChange={(next) => {
                    if (!next) beginCloseCategoryMenu();
                  }}
                  itemUrl={shopAllMenuUrl}
                  panelKey={desktopCollection?.url ?? 'shop-all'}
                  initialOpenSection={resolveDesktopCategoryInitialSection(
                    desktopCollection?.url ?? shopAllMenuUrl,
                    chipSnapshot,
                  )}
                  staggerPhase={desktopStaggerPhase}
                  categoryMenuPhase={categoryMenuPhase}
                  onPointerEnter={cancelCategoryMenuClose}
                  onPointerLeave={scheduleCategoryMenuClose}
                  onNavigate={closeCategoryMenu}
                  onMotionEnd={
                    categoryMenuPhase === 'closing'
                      ? finishCloseCategoryMenu
                      : undefined
                  }
                >
                  <HeaderNavLink
                    to={resolveCatalogNavTo(shopAllMenuUrl)}
                    prefetch="intent"
                    active={
                      isNavCollectionRootActive(pathname, shopAllMenuUrl) ||
                      (categoryMenuPhase === 'open' &&
                        desktopCollection?.url === shopAllMenuUrl)
                    }
                    onMouseEnter={() =>
                      openDesktopCollectionMenu(shopAllMenuItem)
                    }
                    onFocus={(e) => { if (e.relatedTarget) openDesktopCollectionMenu(shopAllMenuItem); }}
                    onClick={closeCategoryMenu}
                  >
                    {DESKTOP_SHOP_ALL_NAV_LABEL}
                  </HeaderNavLink>
                </DesktopCategoryNavPopover>
              )}

              {primaryMenuItems.map((item) => {
                const url = normalizeMenuUrl({
                  url: 'url' in item ? item.url : '',
                  primaryDomainUrl,
                  publicStoreDomain,
                });

                if (!url) return null;

                const isLinkActive = isNavCollectionRootActive(pathname, url);
                const sharedLinkProps = {
                  active: isLinkActive,
                  onMouseEnter: () => openDesktopCollectionMenu(item),
                  onFocus: (e: React.FocusEvent) => { if (e.relatedTarget) openDesktopCollectionMenu(item); },
                  onClick: closeCategoryMenu,
                };

                if (isExternalUrl(url)) {
                  return (
                    <HeaderNavLink
                      key={item.title}
                      external
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      {...sharedLinkProps}
                    >
                      {item.title}
                    </HeaderNavLink>
                  );
                }

                return (
                  <DesktopCategoryNavPopover
                    key={item.title}
                    open={
                      desktopCollection?.url === url &&
                      categoryMenuPhase !== 'idle'
                    }
                    onOpenChange={(next) => {
                      if (!next) beginCloseCategoryMenu();
                    }}
                    itemUrl={url}
                    panelKey={desktopCollection?.url ?? url}
                    initialOpenSection={resolveDesktopCategoryInitialSection(
                      desktopCollection?.url ?? url,
                      chipSnapshot,
                    )}
                    staggerPhase={desktopStaggerPhase}
                    categoryMenuPhase={categoryMenuPhase}
                    onPointerEnter={cancelCategoryMenuClose}
                    onPointerLeave={scheduleCategoryMenuClose}
                    onNavigate={closeCategoryMenu}
                    onMotionEnd={
                      categoryMenuPhase === 'closing'
                        ? finishCloseCategoryMenu
                        : undefined
                    }
                  >
                    <HeaderNavLink
                      to={resolveCatalogNavTo(url)}
                      prefetch="intent"
                      {...sharedLinkProps}
                    >
                      {item.title}
                    </HeaderNavLink>
                  </DesktopCategoryNavPopover>
                );
              })}
            </div>

            {/* Desktop: Centered Logo — Link (not <a>) for SPA navigation, no full-page reload */}
            <Link
              to="/"
              prefetch="intent"
              className="hidden lg:block absolute left-1/2 -translate-x-1/2 z-10"
            >
              <img
                src="/Dark_Blue_Horizontal.png"
                alt="ZEHN"
                translate="no"
                className="h-12 w-auto border-0 rounded-none"
                style={{border: 'none', outline: 'none', borderRadius: '0'}}
              />
            </Link>

            {/* Mobile: Centered Logo — prefetch="viewport" because touch has no hover (intent is dead on mobile) */}
            <div className="absolute left-1/2 -translate-x-1/2 lg:hidden">
              <Link to="/" prefetch="viewport">
                <img
                  src="/Dark_Blue_Horizontal.png"
                  alt="ZEHN"
                  translate="no"
                  className="h-10 w-auto border-0 rounded-none"
                  style={{border: 'none', outline: 'none', borderRadius: '0'}}
                />
              </Link>
            </div>

            {/* Spacer - pushes right icons to the end (both mobile and desktop) */}
            <div className="flex-grow" />

            {/* Right: Action Icons */}
            <div className="flex items-center gap-0.5 sm:gap-1 lg:gap-4 ml-0 lg:ml-0">
              {/* Search Icon */}
              <HeaderNavIconButton
                className="hidden lg:flex"
                active={isSearchOpen}
                ariaLabel="Suche"
                onClick={() => setIsSearchOpen(true)}
              >
                <HeaderNavIcon icon={Search} active={isSearchOpen} />
              </HeaderNavIconButton>

              {/* Account Icon */}
              <Suspense
                fallback={
                  <HeaderNavIconButton
                    as="link"
                    to="/account/login"
                    active={pathname.startsWith('/account')}
                    ariaLabel="Anmelden"
                    title="Anmelden"
                  >
                    <HeaderNavIcon
                      icon={User}
                      active={pathname.startsWith('/account')}
                    />
                  </HeaderNavIconButton>
                }
              >
                <Await resolve={isLoggedInPromise}>
                  {(isLoggedIn) => {
                    const accountUrl = isLoggedIn
                      ? '/account'
                      : '/account/login';
                    const isAccountActive = pathname.startsWith('/account');
                    return (
                      <HeaderNavIconButton
                        as="link"
                        to={accountUrl}
                        active={isAccountActive}
                        ariaLabel={isLoggedIn ? 'Mein Konto' : 'Anmelden'}
                        title={isLoggedIn ? 'Mein Konto' : 'Anmelden'}
                      >
                        <HeaderNavIcon icon={User} active={isAccountActive} />
                        {isLoggedIn && (
                          <span
                            className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"
                            aria-hidden="true"
                          />
                        )}
                      </HeaderNavIconButton>
                    );
                  }}
                </Await>
              </Suspense>

              {/* Wishlist Icon - Desktop only, mobile in sidebar */}
              <span className="hidden lg:block">
                <WishlistHeaderIcon pathname={pathname} />
              </span>

              {/* Cart Icon - Always on desktop, conditional on mobile (only when items in cart) */}
              <MobileCartButton
                active={isCartOpen}
                onClick={() => setIsCartOpen(true)}
              />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div
            id="zehn-mobile-menu"
            className={cn(
              'lg:hidden overflow-hidden transition-all ease-out',
              isMobileMenuShellExpanded && isMenuShellMounted(mobileMenuPhase)
                ? cn(
                    HEADER_NAV_MOBILE_MENU_MAX_H,
                    'flex min-h-0 flex-col overflow-hidden pb-4',
                  )
                : 'max-h-0',
            )}
            style={{transitionDuration: `${mobileShellTransitionMs}ms`}}
          >
            <div
              ref={mobileMenuRef}
              className={cn(
                'flex min-h-0 flex-col gap-4 border-t border-foreground/10 bg-white/95 px-4 pb-4 pt-4 rounded-2xl',
                isMobileMenuShellExpanded &&
                  isMenuShellMounted(mobileMenuPhase) &&
                  'flex-1 overflow-y-auto overscroll-contain',
              )}
            >
              {[shopAllMenuItem, ...primaryMenuItems]
                .filter(Boolean)
                .map((rawItem, itemIndex) => {
                  const item = rawItem as MenuEntry;
                  const itemUrl =
                    normalizeMenuUrl({
                      url: 'url' in item ? item.url : '',
                      primaryDomainUrl,
                      publicStoreDomain,
                    }) ?? item.title;

                  return (
                    <ZehnNavStaggerItem
                      key={item.title}
                      index={itemIndex}
                      total={mobileStaggerTotal}
                      phase={mobileMenuStaggerPhase}
                    >
                      <MobileCollectionMenuSection
                        item={item}
                        isOpen={openMobileCollection === itemUrl}
                        freezeContent={
                          mobileMenuAccordionFrozen &&
                          openMobileCollection === itemUrl
                        }
                        initialOpenSection={
                          openMobileCollection === itemUrl
                            ? openMobileSection
                            : null
                        }
                        onToggle={() => {
                          setOpenMobileCollection((current) => {
                            if (current === itemUrl) return null;
                            const hint = mobileAccordionHintRef.current;
                            if (
                              hint.collectionMenuUrl === itemUrl &&
                              hint.sectionTitle
                            ) {
                              setOpenMobileSection(hint.sectionTitle);
                            }
                            return itemUrl;
                          });
                        }}
                        onNavigate={closeMobileMenuOnNavigate}
                        primaryDomainUrl={primaryDomainUrl}
                        publicStoreDomain={publicStoreDomain}
                      />
                    </ZehnNavStaggerItem>
                  );
                })}
              {/* Mobile-only: Wishlist link */}
              <ZehnNavStaggerItem
                index={mobileNavMenuEntries.length}
                total={mobileStaggerTotal}
                phase={mobileMenuStaggerPhase}
              >
                <HeaderNavMobileLabeledRow
                  to="/wishlist"
                  active={pathname === '/wishlist'}
                  onClick={closeMobileMenuOnNavigate}
                  icon={Heart}
                  iconClassName={
                    wishlistCount > 0 ? 'fill-accent text-accent' : undefined
                  }
                  label="Wunschliste"
                  count={wishlistCount}
                  strokeWidth={HEADER_NAV_ICON_STROKE}
                />
              </ZehnNavStaggerItem>
              {/* Mobile-only: Cart link */}
              <ZehnNavStaggerItem
                index={mobileNavMenuEntries.length + 1}
                total={mobileStaggerTotal}
                phase={mobileMenuStaggerPhase}
              >
                <MobileMenuCartButton
                  active={isCartOpen}
                  onClick={() => {
                    beginCloseMobileMenu();
                    setIsCartOpen(true);
                  }}
                />
              </ZehnNavStaggerItem>
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

function MobileMenuActivityDot({wishlistCount}: {wishlistCount: number}) {
  if (wishlistCount === 0) return null;

  return (
    <span
      className={`absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-accent ${HEADER_NAV_COUNT_BADGE_RING}`}
      aria-hidden="true"
    />
  );
}

function MobileMenuCartButtonInner({
  active,
  onClick,
}: {
  active?: boolean;
  onClick: () => void;
}) {
  const count = useHeaderCartCount();

  return (
    <HeaderNavMobileLabeledRow
      as="button"
      active={active}
      onClick={onClick}
      ariaLabel={count > 0 ? `Warenkorb, ${count} Artikel` : 'Warenkorb'}
      icon={ShoppingBag}
      iconClassName={count > 0 ? 'text-accent' : undefined}
      label="Warenkorb"
      count={count}
      strokeWidth={HEADER_NAV_ICON_STROKE}
    />
  );
}

function MobileMenuCartButton({
  active,
  onClick,
}: {
  active?: boolean;
  onClick: () => void;
}) {
  const data = useRouteLoaderData<RootLoader>('root');
  const cartPromise = data ? (data as any).cart : undefined;

  return (
    <Suspense
      fallback={
        <HeaderNavMobileLabeledRow
          as="button"
          active={active}
          onClick={onClick}
          ariaLabel="Warenkorb"
          icon={ShoppingBag}
          label="Warenkorb"
          count={0}
          strokeWidth={HEADER_NAV_ICON_STROKE}
        />
      }
    >
      <Await resolve={cartPromise}>
        <MobileMenuCartButtonInner active={active} onClick={onClick} />
      </Await>
    </Suspense>
  );
}

function MobileCartButtonInner({
  active,
  onClick,
}: {
  active?: boolean;
  onClick: () => void;
}) {
  const count = useHeaderCartCount();
  const isCartActive = active || count > 0;

  return (
    <span className="relative inline-flex">
      <HeaderNavIconButton
        active={isCartActive}
        ariaLabel={count > 0 ? `Warenkorb, ${count} Artikel` : 'Warenkorb'}
        onClick={onClick}
      >
        <ShoppingBag
          className={`w-5 h-5 ${count > 0 ? 'text-accent' : ''}`}
          strokeWidth={HEADER_NAV_ICON_STROKE}
          aria-hidden
        />
      </HeaderNavIconButton>
      <HeaderNavCountBadge count={count} />
    </span>
  );
}

function MobileCartButton({
  active,
  onClick,
}: {
  active?: boolean;
  onClick: () => void;
}) {
  const data = useRouteLoaderData<RootLoader>('root');
  const cartPromise = data ? (data as any).cart : undefined;

  return (
    <Suspense
      fallback={
        <HeaderNavIconButton
          active={active}
          ariaLabel="Warenkorb"
          onClick={onClick}
        >
          <HeaderNavIcon icon={ShoppingBag} active={active} />
        </HeaderNavIconButton>
      }
    >
      <Await resolve={cartPromise}>
        <MobileCartButtonInner active={active} onClick={onClick} />
      </Await>
    </Suspense>
  );
}

function WishlistHeaderIcon({pathname}: {pathname: string}) {
  const {count} = useWishlist();
  const isWishlistActive = pathname === '/wishlist' || count > 0;
  return (
    <span className="relative inline-flex">
      <HeaderNavIconButton
        as="link"
        to="/wishlist"
        active={isWishlistActive}
        ariaLabel={count > 0 ? `Wunschliste, ${count} Artikel` : 'Wunschliste'}
        title="Wunschliste"
      >
        <Heart
          className={`w-5 h-5 ${count > 0 ? 'fill-accent text-accent' : ''}`}
          strokeWidth={HEADER_NAV_ICON_STROKE}
          aria-hidden
        />
      </HeaderNavIconButton>
      <HeaderNavCountBadge count={count} />
    </span>
  );
}
