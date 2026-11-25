import { useTranslation } from 'react-i18next';

export function AuthBrandPanel() {
  const { t } = useTranslation();

  return (
    <aside className="from-brand-panel-from to-brand-panel-to relative hidden overflow-hidden bg-linear-to-br p-12 text-white lg:flex lg:flex-col lg:justify-center">
      <div className="relative z-10 lg:-translate-y-8">
        <div className="mb-card text-h4 flex size-12 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20">
          {t('authBrand.logoMark')}
        </div>
        <h1 className="text-h1">{t('shell.brand.title')}</h1>
        <p className="text-h3 mt-row text-white">{t('shell.brand.subtitle')}</p>
        <p className="text-b2 mt-field text-white/80">{t('authBrand.body')}</p>
        <p className="text-h5 mt-card pt-card border-t border-white/20 text-white">
          {t('authBrand.tagline')}
        </p>
      </div>
      <span
        aria-hidden
        className="absolute -end-16 -bottom-20 size-72 rotate-[18deg] rounded-[3rem] bg-white/10"
      />
    </aside>
  );
}
