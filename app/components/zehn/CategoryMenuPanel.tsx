/**
 * Shared category accordion — desktop hover popover + mobile drawer (BL-0017 / BL-0018).
 */
import {useState} from 'react';
import {useIsomorphicLayoutEffect} from '~/hooks/useIsomorphicLayoutEffect';
import {useLocation} from 'react-router';
import {ZehnLink} from './ZehnLink';
import {ChevronDown} from 'lucide-react';
import {HeaderNavAccordionRow} from './HeaderNavAccordionRow';
import {ZehnNavStaggerItem} from './ZehnNavStaggerItem';
import {useCatalogChipNav} from '~/components/zehn/catalog-chip-nav-context';
import {
  getCategoryLabel,
  getCollectionRootSlug,
  MAIN_CATEGORY_MAP,
} from '~/lib/category-map';
import {
  HEADER_NAV_DROPDOWN_SUBLIST,
  cnHeaderNavDropdownLink,
  cnHeaderNavDropdownSection,
} from '~/lib/header-nav-styles';
import {
  isCatalogMenuLinkActive,
  resolveChipMenuOpenSection,
} from '~/lib/header-nav-active';
import {menuPhaseToStagger} from '~/lib/nav-menu-phase';

type CategoryMenuLink = {title: string; handle: string};
type CategoryMenuSection = CategoryMenuLink & {items: CategoryMenuLink[]};

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

export type CategoryMenuPanelProps = {
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
};

export function CategoryMenuPanel({
  id,
  className,
  onNavigate,
  rootSourceUrl,
  idPrefix = 'category-section',
  interactionMode = 'toggleRow',
  initialOpenSection = null,
  staggerPhase = 'idle',
}: CategoryMenuPanelProps) {
  const [openSection, setOpenSection] = useState<string | null>(
    initialOpenSection ?? null,
  );
  const {pathname} = useLocation();
  const chipSnapshot = useCatalogChipNav();
  const rootSlug = getCollectionRootSlug(rootSourceUrl ?? pathname);

  const chipOpenSection = resolveChipMenuOpenSection(rootSlug, chipSnapshot);
  /** Never bleed section state from a different catalog root into this panel. */
  const resolvedOpenSection =
    chipSnapshot.rootSlug === rootSlug
      ? (chipOpenSection ?? initialOpenSection ?? null)
      : (chipOpenSection ?? null);

  /** Re-sync accordion before paint — prevents stale section flash when chip context updates (BL-0017). */
  useIsomorphicLayoutEffect(() => {
    setOpenSection(resolvedOpenSection);
  }, [resolvedOpenSection]);

  const linkActive = (
    linkUrl: string,
    mode: 'exact' | 'descendant',
  ): boolean =>
    isCatalogMenuLinkActive(pathname, linkUrl, mode, chipSnapshot);

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
                isRouteActive={linkActive(alleSectionUrl, 'descendant')}
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
                    <ZehnLink
                      to={alleSectionUrl}
                      tier="nav"
                      onClick={() => {
                        /* Blur before popover sets aria-hidden — prevents focus-in-aria-hidden warning */
                        (document.activeElement as HTMLElement | null)?.blur();
                        onNavigate?.();
                      }}
                      className={cnHeaderNavDropdownLink({
                        active: linkActive(alleSectionUrl, 'exact'),
                      })}
                    >
                      Alle {section.title}
                    </ZehnLink>
                    {section.items.map((item) => {
                      const itemUrl = `/collections/${rootSlug}/alle-${section.handle}/${item.handle}`;
                      return (
                        <ZehnLink
                          key={`${section.title}-${item.title}`}
                          to={itemUrl}
                          state={null}
                          tier="nav"
                          onClick={() => {
                            (document.activeElement as HTMLElement | null)?.blur();
                            onNavigate?.();
                          }}
                          className={cnHeaderNavDropdownLink({
                            active: linkActive(itemUrl, 'exact'),
                          })}
                        >
                          {item.title}
                        </ZehnLink>
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
