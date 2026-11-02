/** 同页选择识别用途，复用现有配置修订和保存接口。 */
import { useState } from 'react'
import { Modal, Button } from '@beellix-ai/ui-components'
import type { SettingsNamespaceView } from '@beellix-ai/api-remotes/client'
import type { ProviderRow } from './store.ts'
import type { ModelsOperations } from './operations.ts'
import type { en } from './locales.ts'
import css from './VendorCatalog.module.css'
import form from './ModelsSection.module.css'

export function ModelPurposes({ namespace, rows, operations, readOnly, onSaved, t }: {
  namespace: SettingsNamespaceView | undefined; rows: readonly ProviderRow[]; operations: ModelsOperations; readOnly: boolean; onSaved: () => Promise<void>; t: (key: keyof typeof en) => string
}) {
  const [busy, setBusy] = useState(false), [error, setError] = useState<string>()
  const [open, setOpen] = useState(false)
  if (!namespace) return null
  const values = namespace.value as Record<string, { provider: string; model: string } | null>
  const choices = rows.filter(row => row.entry.active && row.credential?.configured !== false).flatMap(row => row.entry.vendor?.models.filter(model => model.enabled !== false && model.inputModalities?.includes('image')).map(model => ({ row, model, key: `${row.entry.provider}/${model.id}` })) ?? [])
  const save = async (purpose: 'vision' | 'ocr', key: string) => {
    if (readOnly || busy) return
    setBusy(true); setError(undefined)
    const choice = choices.find(item => item.key === key)
    try {
      const result = await operations.writeSettings(namespace.ns, [{ op: 'set', path: [purpose], value: choice ? { provider: choice.row.entry.provider, model: choice.model.id } : null }], namespace.revision)
      if (result.kind !== 'written') setError(result.message)
      await onSaved()
    } catch { setError(t('modelSaveFailed')) } finally { setBusy(false) }
  }
  return <><div className={css['catalogActions']}><Button size="sm" variant="outline" onClick={() => setOpen(true)}>{t('advancedSettings')}</Button></div>
  <Modal open={open} title={t('modelPurposes')} closeLabel={t('close')} onClose={() => setOpen(false)}><section className={css['purposePanel']} aria-label={t('modelPurposes')}>
    {(['vision', 'ocr'] as const).map(purpose => {
      const current = values[purpose], key = current ? `${current.provider}/${current.model}` : ''
      const available = choices.filter(choice => purpose !== 'vision' || choice.model.purpose !== 'ocr')
      return <label key={purpose}><span>{t(purpose === 'vision' ? 'visionPurpose' : 'ocrPurpose')}</span><select className={form['selectInput']} aria-label={t(purpose === 'vision' ? 'visionPurpose' : 'ocrPurpose')} value={key} disabled={readOnly || busy} onChange={event => { void save(purpose, event.target.value) }}>
        <option value="">{t('purposeUnconfigured')}</option>
        {key && !available.some(choice => choice.key === key) && <option value={key}>{current!.model}（{t('purposeUnavailable')}）</option>}
        {available.map(choice => <option key={choice.key} value={choice.key}>{choice.model.name} · {choice.row.entry.vendor!.name}</option>)}
      </select></label>
    })}
    {busy && <span role="status">{t('applying')}</span>}{error && <p role="alert">{error}</p>}
  </section></Modal></>
}
