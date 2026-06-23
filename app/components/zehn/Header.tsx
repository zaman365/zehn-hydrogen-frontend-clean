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
import {HeaderNavAccordionRow} from './HeaderNavAccordionRow';
import {
  HeaderNavIcon,
  HeaderNavIconButton,
  HeaderNavLink,
  HeaderNavMobileAction,
  HeaderNavMobileRow,
} from './HeaderNavItem';
import {useWishlist} from '~/components/zehn/wishlist-context';
import type {RootLoader} from '~/root';
import {
  getCategoryLabel,
  getCollectionRootSlug,
  MAIN_CATEGORY_MAP,
} from '~/lib/category-map';
import {
  HEADER_NAV_ICON_STROKE,
  DESKTOP_SHOP_ALL_NAV_LABEL,
  HEADER_NAV_MOBILE_SUBMENU_INDENT,
  HEADER_NAV_DROPDOWN_SUBLIST,
  HEADER_NAV_MOBILE_MENU_MAX_H,
  cnHeaderNavDropdownLink,
  cnHeaderNavDropdownSection,
} from '~/lib/header-nav-styles';
import {
  ZEHN_DROPDOWN_POSITIONER_OPEN,
  ZEHN_NAV_SURFACE,
  ZEHN_SURFACE_GLOW,
  ZEHN_SURFACE_GLOW_BLEED,
} from '~/lib/zehn-surface-styles';
import {ZehnGlassPanel} from './ZehnGlassPanel';
import {ZehnNavStaggerItem} from './ZehnNavStaggerItem';
import {ZEHN_SITE_CONTENT_ROW} from '~/lib/site-content-row';
import {cn} from '~/lib/utils';
import {
  isNavCollectionRootActive,
  isNavLinkActive,
  resolveMobileNavOpenState,
} from '~/lib/header-nav-active';
import {
  isMenuAriaExpanded,
  isMenuShellMounted,
  menuPhaseToStagger,
  shouldFreezeMobileAccordion,
  type NavMenuPhase,
} from '~/lib/nav-menu-phase';
import {useScrollLock} from '~/hooks/useScrollLock';

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
  '/collections/all': DESKTOP_SHOP_ALL_NAV_LABEL,
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
  rootSourceUrl,
  idPrefix = 'category-section',
  interactionMode = 'toggleRow',
  initialOpenSection = null,
  staggerPhase = 'idle',
}: {
  id?: string;
  className: string;
  onNavigate?: () => void;
  rootSourceUrl?: string;
  idPrefix?: string;
  /** toggleRow: desktop hover dropdown; splitRow: mobile link + chevron */
  interactionMode?: 'toggleRow' | 'splitRow';
  /** Mobile drawer auto-expand: open section matching current route on mount */
  initialOpenSection?: string | null;
  /** Desktop dropdown row stagger — synced to categoryMenuPhase */
  staggerPhase?: ReturnType<typeof menuPhaseToStagger>;
}) {
  const [openSection, setOpenSection] = useState<string | null>(
    initialOpenSection ?? null,
  );
  const {pathname} = useLocation();
  const rootSlug = getCollectionRootSlug(rootSourceUrl ?? pathname);

  return (
    <nav id={id} className={className} aria-label="Kategorien">
      {CATEGORY_MENU_SECTIONS.map((section, sectionIndex) => {
        const sectionId = `${idPrefix}-${section.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')}`;
        const isOpen = openSection === section.title;
        const alleSectionUrl = `/collections/${rootSlug}/alle-${section.handle}`;

        return (
          <ZehnNavStaggerItem
            key={section.title}
            index={sectionIndex}
            total={CATEGORY_MENU_SECTIONS.length}
            phase={staggerPhase}
            className="py-[5px] first:pt-0 last:pb-0"
          >
            {interactionMode === 'splitRow' ? (
              <HeaderNavAccordionRow
                to={alleSectionUrl}
                label={section.title}
                isOpen={isOpen}
                isRouteActive={isNavLinkActive(
                  pathname,
                  alleSectionUrl,
                  'descendant',
                )}
                onToggle={() =>
                  setOpenSection((current) =>
                    current === section.title ? null : section.title,
                  )
                }
                onNavigate={onNavigate}
                ariaControls={sectionId}
              />
            ) : (
              <button
                type="button"
                onClick={() =>
                  setOpenSection((current) =>
                    current === section.title ? null : section.title,
                  )
                }
                className={cnHeaderNavDropdownSection({active: isOpen})}
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
            )}
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
                  <div className={HEADER_NAV_DROPDOWN_SUBLIST}>
                    <Link
                      to={alleSectionUrl}
                      prefetch="intent"
                      onClick={onNavigate}
                      className={cnHeaderNavDropdownLink({
                        active: isNavLinkActive(
                          pathname,
                          alleSectionUrl,
                          'exact',
                        ),
                      })}
                    >
                      Alle {section.title}
                    </Link>
                    {section.items.map((item) => {
                      const itemUrl = `/collections/${rootSlug}/alle-${section.handle}/${item.handle}`;
                      return (
                        <Link
                          key={`${section.title}-${item.title}`}
                          to={itemUrl}
                          prefetch="intent"
                          onClick={onNavigate}
                          className={cnHeaderNavDropdownLink({
                            active: isNavLinkActive(
                              pathname,
                              itemUrl,
                              'exact',
                            ),
                          })}
                        >
                          {item.title}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            }
          </ZehnNavStaggerItem>
        );
      })}
    </nav>
  );
}

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
        to={url}
        label={item.title}
        isOpen={isOpen}
        isRouteActive={isNavCollectionRootActive(pathname, url)}
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
              interactionMode="splitRow"
              initialOpenSection={initialOpenSection}
              className={cn(HEADER_NAV_MOBILE_SUBMENU_INDENT, 'flex flex-col gap-1')}
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
  const [dropdownCenterOffset, setDropdownCenterOffset] = useState<
    number | null
  >(null);
  const [openMobileCollection, setOpenMobileCollection] = useState<
    string | null
  >(null);
  const [openMobileSection, setOpenMobileSection] = useState<string | null>(
    null,
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const desktopNavTriggersRef = useRef<HTMLDivElement>(null);
  const headerNavRef = useRef<HTMLElement>(null);
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
  const {count: wishlistCount} = useWishlist();
  const {pathname} = useLocation();

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
    setDropdownCenterOffset(null);
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
    (item: MenuEntry, triggerEl?: HTMLElement) => {
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

  const openMobileMenu = useCallback(() => {
    cancelMobileMenuCloseTimers();
    mobileMenuCloseFinishedRef.current = false;
    setMobileShellTransitionMs(MOBILE_SHELL_COLLAPSE_MS);
    setIsMobileMenuShellExpanded(true);
    setMobileMenuPhase('open');
  }, [cancelMobileMenuCloseTimers]);

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
      cancelMobileMenuCloseTimers();
    },
    [cancelCategoryMenuClose, cancelMobileMenuCloseTimers],
  );

  useEffect(() => {
    if (categoryMenuPhase !== 'open') return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && desktopNavTriggersRef.current?.contains(target)) return;
      if (target && categoryMenuRef.current?.contains(target)) return;
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

  useEffect(() => {
    if (!isMenuShellMounted(mobileMenuPhase)) {
      wasMenuOpenRef.current = false;
      return;
    }

    if (shouldFreezeMobileAccordion(mobileMenuPhase)) return;

    if (!wasMenuOpenRef.current) {
      const resolved = resolveMobileNavOpenState(pathname, mobileNavMenuEntries);
      if (resolved.collectionMenuUrl) {
        setOpenMobileCollection(resolved.collectionMenuUrl);
      }
      setOpenMobileSection(resolved.sectionTitle);
    }

    wasMenuOpenRef.current = true;
  }, [mobileMenuPhase, pathname, mobileNavMenuEntries]);

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
          ref={headerNavRef}
          className={cn(
            'relative py-0 my-0 transition-all duration-600 ease-out',
            ZEHN_SITE_CONTENT_ROW,
            ZEHN_NAV_SURFACE,
            ZEHN_SURFACE_GLOW,
            hasAnimated
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 -translate-y-2',
          )}
          aria-label="Main"
        >
          <div className="flex items-center h-[68px]">
            {/* Mobile: Hamburger menu button */}
            <HeaderNavIconButton
              buttonRef={mobileMenuButtonRef}
              className="lg:hidden"
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
                <HeaderNavLink
                  to={shopAllMenuUrl}
                  prefetch="intent"
                  active={
                    isNavCollectionRootActive(pathname, shopAllMenuUrl) ||
                    (categoryMenuPhase === 'open' &&
                      desktopCollection?.url === shopAllMenuUrl)
                  }
                  onMouseEnter={(e) =>
                    openDesktopCollectionMenu(shopAllMenuItem, e.currentTarget)
                  }
                  onFocus={(e) =>
                    openDesktopCollectionMenu(shopAllMenuItem, e.currentTarget)
                  }
                  onClick={closeCategoryMenu}
                >
                  {DESKTOP_SHOP_ALL_NAV_LABEL}
                </HeaderNavLink>
              )}

              {primaryMenuItems.map((item) => {
                const url = normalizeMenuUrl({
                  url: 'url' in item ? item.url : '',
                  primaryDomainUrl,
                  publicStoreDomain,
                });

                if (!url) return null;

                const isLinkActive = isNavCollectionRootActive(pathname, url);
                const sharedProps = {
                  active: isLinkActive,
                  onMouseEnter: (e: React.MouseEvent<HTMLElement>) =>
                    openDesktopCollectionMenu(item, e.currentTarget),
                  onFocus: (e: React.FocusEvent<HTMLElement>) =>
                    openDesktopCollectionMenu(item, e.currentTarget),
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
                      {...sharedProps}
                    >
                      {item.title}
                    </HeaderNavLink>
                  );
                }

                return (
                  <HeaderNavLink
                    key={item.title}
                    to={url}
                    prefetch="intent"
                    {...sharedProps}
                  >
                    {item.title}
                  </HeaderNavLink>
                );
              })}
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

          {/* Desktop Navigation */}
          {categoryMenuPhase !== 'idle' && (
          <div
            id="zehn-desktop-category-menu"
            ref={categoryMenuRef}
            className={cn(
              'absolute top-full hidden w-fit max-w-[calc(100%_-_2rem)] lg:block',
              ZEHN_DROPDOWN_POSITIONER_OPEN,
              ZEHN_SURFACE_GLOW_BLEED,
            )}
            style={{
              left:
                dropdownCenterOffset !== null
                  ? `${dropdownCenterOffset}px`
                  : '0',
              transform:
                dropdownCenterOffset !== null ? 'translateX(-50%)' : 'none',
            }}
            aria-hidden={categoryMenuPhase === 'closing'}
            {...({
              inert: categoryMenuPhase === 'closing' ? true : undefined,
            } as object)}
            onMouseEnter={cancelCategoryMenuClose}
            onMouseLeave={scheduleCategoryMenuClose}
          >
            <ZehnGlassPanel
              scrollable
              className="w-max max-w-full"
              motion={categoryMenuPhase === 'closing' ? 'exit' : 'enter'}
              onMotionEnd={
                categoryMenuPhase === 'closing'
                  ? finishCloseCategoryMenu
                  : undefined
              }
            >
              <CategoryMenuPanel
                key={desktopCollection?.url ?? 'shop-all'}
                onNavigate={closeCategoryMenu}
                rootSourceUrl={desktopCollection?.url ?? shopAllMenuUrl}
                idPrefix="desktop-category-section"
                className="flex w-max max-w-full flex-col gap-1"
                staggerPhase={desktopStaggerPhase}
              />
            </ZehnGlassPanel>
          </div>
          )}

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
                        onToggle={() =>
                          setOpenMobileCollection((current) =>
                            current === itemUrl ? null : itemUrl,
                          )
                        }
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
                <HeaderNavMobileRow
                  to="/wishlist"
                  active={pathname === '/wishlist'}
                  onClick={closeMobileMenuOnNavigate}
                >
                  <span className="relative mr-3">
                    <Heart
                      className={`w-4 h-4 ${
                        wishlistCount > 0 ? 'fill-accent text-accent' : ''
                      }`}
                      strokeWidth={HEADER_NAV_ICON_STROKE}
                    />
                    {wishlistCount > 0 && <CountBadge count={wishlistCount} />}
                  </span>
                  Wunschliste
                </HeaderNavMobileRow>
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

function MobileMenuCartButton({
  active,
  onClick,
}: {
  active?: boolean;
  onClick: () => void;
}) {
  const data = useRouteLoaderData<RootLoader>('root');
  const cartPromise = data ? (data as any).cart : undefined;

  const renderButton = (count: number) => (
    <HeaderNavMobileAction
      active={active}
      onClick={onClick}
      ariaLabel="Warenkorb"
    >
      <span className="relative mr-3">
        <ShoppingBag
          className={`w-4 h-4 ${count > 0 ? 'text-accent' : ''}`}
          strokeWidth={HEADER_NAV_ICON_STROKE}
        />
        {count > 0 && <CountBadge count={count} />}
      </span>
      Warenkorb
    </HeaderNavMobileAction>
  );

  return (
    <Suspense fallback={renderButton(0)}>
      <Await resolve={cartPromise}>
        {(cart) => renderButton(cart?.totalQuantity ?? 0)}
      </Await>
    </Suspense>
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
        {(cart) => {
          const count = cart?.totalQuantity ?? 0;
          const isCartActive = active || count > 0;
          return (
            <HeaderNavIconButton
              active={isCartActive}
              ariaLabel="Warenkorb"
              onClick={onClick}
            >
              <span className="relative flex items-center justify-center">
                <ShoppingBag
                  className={`w-5 h-5 ${count > 0 ? 'text-accent' : ''}`}
                  strokeWidth={HEADER_NAV_ICON_STROKE}
                  aria-hidden
                />
                {count > 0 && <CountBadge count={count} />}
              </span>
            </HeaderNavIconButton>
          );
        }}
      </Await>
    </Suspense>
  );
}

function WishlistHeaderIcon({pathname}: {pathname: string}) {
  const {count} = useWishlist();
  const isWishlistActive = pathname === '/wishlist' || count > 0;
  return (
    <HeaderNavIconButton
      as="link"
      to="/wishlist"
      active={isWishlistActive}
      ariaLabel="Wunschliste"
      title="Wunschliste"
    >
      <span className="relative flex items-center justify-center">
        <Heart
          className={`w-5 h-5 ${count > 0 ? 'fill-accent text-accent' : ''}`}
          strokeWidth={HEADER_NAV_ICON_STROKE}
          aria-hidden
        />
        {count > 0 && <CountBadge count={count} />}
      </span>
    </HeaderNavIconButton>
  );
}
