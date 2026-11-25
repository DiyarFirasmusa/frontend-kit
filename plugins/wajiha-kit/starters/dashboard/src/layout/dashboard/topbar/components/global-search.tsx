import { useEffect, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { DataBadge } from '@/components/table/data-badge';
import { Building2, Hash, Search, Tag, Warehouse } from '@/lib/icons';
import type { IconComponent } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { useGlobalSearch } from '../hooks/use-global-search';
import type { GlobalSearchGroup, GlobalSearchOption } from '../types/types';

const GROUP_ICON: Record<GlobalSearchGroup, IconComponent> = {
  warehouses: Warehouse,
  suppliers: Building2,
  categories: Tag,
  units: Hash,
};

function OptionText({ option }: { option: GlobalSearchOption }): ReactElement {
  const { t } = useTranslation();
  return (
    <>
      <span className="select-item-label flex flex-col">
        <span className="text-b2 text-text-primary truncate">
          {option.title ?? '—'}
        </span>
        {option.subtitle ? (
          <span className="text-b3 text-text-muted truncate" dir="auto">
            {option.subtitle}
          </span>
        ) : null}
      </span>
      {option.inactive ? (
        <DataBadge tone="neutral" shape="pill">
          {t('common.inactive')}
        </DataBadge>
      ) : null}
    </>
  );
}

export function GlobalSearch({
  className,
}: {
  className?: string;
}): ReactElement {
  const { t } = useTranslation();
  const search = useGlobalSearch();
  const { activeIndex, optionId, status, isPopupVisible, listboxId, sections } =
    search;
  const activeId = activeIndex >= 0 ? optionId(activeIndex) : undefined;

  useEffect(() => {
    if (activeId) {
      document
        .querySelector(`#${activeId}`)
        ?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [activeId]);

  return (
    <div
      data-slot="global-search"
      className={cn('relative min-w-0 flex-1', className)}
    >
      <Search className="text-text-muted pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2" />
      <input
        ref={search.inputRef}
        type="text"
        role="combobox"
        aria-label={t('search.label')}
        aria-autocomplete="list"
        aria-expanded={isPopupVisible}
        aria-controls={
          isPopupVisible && status === 'results' ? listboxId : undefined
        }
        aria-activedescendant={isPopupVisible ? activeId : undefined}
        autoComplete="off"
        spellCheck={false}
        placeholder={t('search.placeholder')}
        value={search.value}
        onChange={search.onChange}
        onFocus={search.onFocus}
        onBlur={search.onBlur}
        onKeyDown={search.onKeyDown}
        className="control ps-10 pe-16"
      />
      <kbd
        aria-hidden
        data-slot="kbd"
        dir="ltr"
        className="bg-kbd text-text-secondary text-b3 pointer-events-none absolute end-2 top-1/2 inline-flex h-6 min-w-6 -translate-y-1/2 items-center justify-center rounded-(--radius-kbd) px-1.5"
      >
        {search.shortcutLabel}
      </kbd>

      {isPopupVisible ? (
        <div
          className="select-popup absolute inset-x-0 top-full mt-2 w-full"
          onMouseDown={(event) => {
            event.preventDefault();
          }}
        >
          {status === 'results' ? (
            <div
              id={listboxId}
              role="listbox"
              aria-label={t('search.results')}
              className="select-popup-list"
            >
              {sections.map((section) => {
                const Icon = GROUP_ICON[section.group];
                const headingId = `${listboxId}-${section.group}`;
                return (
                  <div
                    key={section.group}
                    role="group"
                    aria-labelledby={headingId}
                  >
                    <div
                      id={headingId}
                      className="text-label text-text-secondary gap-field flex items-center px-2 pt-2 pb-1"
                    >
                      <Icon className="size-4" />
                      {t(`search.groups.${section.group}`)}
                    </div>
                    {section.options.map(({ option, index }) => (
                      <div
                        key={`${option.group}-${option.id}`}
                        id={optionId(index)}
                        role="option"
                        aria-selected={index === activeIndex}
                        className="select-item"
                        onMouseMove={() => {
                          if (index !== activeIndex) {
                            search.onHover(index);
                          }
                        }}
                        onClick={() => {
                          search.onSelect(option);
                        }}
                      >
                        <OptionText option={option} />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              role="status"
              className={cn(
                'select-empty',
                status === 'error' && 'text-danger',
              )}
            >
              {t(`search.${status}`)}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
