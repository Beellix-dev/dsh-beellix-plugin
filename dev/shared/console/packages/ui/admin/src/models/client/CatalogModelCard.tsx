/** 对话与语音模型复用相同卡片；能力文字按模型类型呈现，不虚构语音 token 限额。 */
import type { ReactNode } from 'react'
import type { en } from './locales.ts'
import { vendorIcons } from './vendor-icons.ts'
import css from './VendorCatalog.module.css'
export interface CatalogModel { id: string; name: string; inputModalities?: readonly string[]; contextWindow?: number }
type Translate = (key: keyof typeof en) => string
export function capacity(value: number | undefined, _t: Translate): string {
  if (value === undefined) return _t('catalogUnknown')
  return value >= 1_000_000 ? `${Number((value / 1_000_000).toFixed(2))}M` : value >= 1000 ? `${Number((value / 1000).toFixed(2))}K` : String(value)
}
export function Mark({ id }: { id: string }) {
  const icon = vendorIcons[id]
  return icon ? <img className={css['mark']} data-vendor-icon={id} data-monochrome={icon.monochrome} src={icon.src} alt="" width={32} height={32} /> : <svg className={css['mark']} viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 9-9 9-9-9Z" fill="none" stroke="currentColor" /></svg>
}
export function Modalities({ model, t }: { model: CatalogModel; t: Translate }) {
  return <span className={css['chips']}>{model.inputModalities?.length ? model.inputModalities.map(input => <span key={input}>{input === 'text' ? t('catalogText') : input === 'image' ? t('catalogImage') : input === 'audio' ? t('catalogAudio') : input === 'video' ? t('catalogVideo') : t('catalogOtherInput')}</span>) : <span>{t('catalogUnknown')}</span>}</span>
}
export function CatalogModelCard({ model, vendor, speech, t, children, href }: { model: CatalogModel; vendor: string; speech: boolean; t: Translate; children: ReactNode; href?: string }) {
  return <article className={css['modelCard']} data-model-kind={speech ? 'speech' : 'chat'}>
    <div className={css['cardTop']}><Mark id={vendor} /><h3 aria-label={model.name}>{href ? <a href={href} aria-label={`${t('catalogViewModel')} ${model.name}`}>{model.name}</a> : model.name}</h3><div className={css['headerActions']}>{children}</div></div>
    <div className={css['modelCapacity']}><Modalities model={model} t={t} /></div>
    <details className={css['modelDetails']}><summary>{t('catalogModelDetail')}</summary><code>{model.id}</code></details>
    <div className={css['modelCapacity']}><span>{t(speech ? 'catalogOutput' : 'contextWindow')}</span><strong>{speech ? t('catalogText') : capacity(model.contextWindow, t)}</strong></div>
  </article>
}
