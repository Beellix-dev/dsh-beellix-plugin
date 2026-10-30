/** 厂商共享连接和模型独立启停；开发者定义的模型能力保持只读。 */
import { useState, type ReactNode } from 'react'
import { VendorCatalog, type CatalogLocation } from './VendorCatalog.tsx'
import type { SettingsNamespaceView } from '@beellix-ai/api-remotes/client'
import type { ProviderRow } from './store.ts'
import type { ModelsOperations } from './operations.ts'
import type { en } from './locales.ts'
import styles from './ModelsSection.module.css'
import type { PropsRuntime } from '@beellix-ai/ui-platform/slots'

interface Props {
  location?: CatalogLocation
  rows: readonly ProviderRow[]
  namespaces: ReadonlyMap<string, SettingsNamespaceView>
  operations: ModelsOperations
  t: (key: keyof typeof en) => string
  readOnly: boolean
  onSaved: () => void | Promise<void>
  renderSpeechControls?: (model: { id: string; name: string }, credentialRef: string) => ReactNode
  webSearch?: PropsRuntime<'settings.models.page'>['webSearch']
}

export function VendorModelsPanel({ rows, namespaces, operations, t, readOnly, onSaved, renderSpeechControls, webSearch, location = {} }: Props) {
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const toggleConnection = async (row: ProviderRow, enabled: boolean): Promise<void> => {
    if(readOnly||busy)return
    const namespace=namespaces.get(row.entry.settingsNs)
    if(!namespace){setError(t('loadFailed'));return}
    setBusy(true);setSaved(false);setError(undefined)
    try{
      const result=await operations.writeSettings(row.entry.settingsNs,[{op:'set',path:[...row.entry.settingsPath,'enabled'],value:enabled}],namespace.revision)
      if(result.kind!=='written'){setError(result.message);await onSaved();return}
      await onSaved();setSaved(true)
    }catch{setError(t('modelSaveFailed'))}finally{setBusy(false)}
  }
  const toggleModel = async (row: ProviderRow, model: string, enabled: boolean): Promise<void> => {
    if (readOnly || busy) return
    const namespace = namespaces.get(row.entry.settingsNs)
    if (!namespace) { setError(t('loadFailed')); return }
    setBusy(true); setSaved(false); setError(undefined)
    try {
      const result = await operations.writeSettings(row.entry.settingsNs, [{op:'set',path:[...row.entry.settingsPath,'modelEnabled',model],value:enabled}], namespace.revision)
      if (result.kind !== 'written') { setError(result.message); await onSaved(); return }
      await onSaved()
      setSaved(true)
    } catch { setError(t('modelSaveFailed')) } finally { setBusy(false) }
  }
  return <VendorCatalog key={JSON.stringify(location)} rows={rows} location={location} t={t} readOnly={readOnly} saved={saved} modelBusy={busy} modelError={error} renderSpeechControls={renderSpeechControls} webSearch={webSearch} onConnectionChange={(row,enabled)=>{void toggleConnection(row,enabled)}} onModelChange={(row, model, enabled) => { void toggleModel(row, model, enabled) }} editor={(row,close) => {
    const namespace = namespaces.get(row.entry.settingsNs)
    if (!namespace) return <p role="alert" className={styles['error']}>{t('loadFailed')}</p>
    return <ConnectionEditor key={row.entry.provider} row={row} namespace={namespace} operations={operations} t={t} readOnly={readOnly} onCancel={close} onSaving={() => setSaved(false)} onSaved={async () => {await onSaved();setSaved(true);close?.()}} />
  }} />
}
export function ConnectionEditor({ row, namespace, operations, t, readOnly, onSaved, onCancel, onSaving, preserveNativeAuthentication = false }: {
  row: ProviderRow; namespace: SettingsNamespaceView; operations: ModelsOperations; t: Props['t']; readOnly: boolean; onSaved: Props['onSaved']; onCancel?: (() => void) | undefined; onSaving: () => void; preserveNativeAuthentication?: boolean
}) {
  const vendor = row.entry.vendor!
  const profile = row.entry.settingsPath.reduce<unknown>((value, key) => typeof value === 'object' && value !== null ? Reflect.get(value, key) : undefined, namespace.value) as {streamIdleTimeoutMs?: number} | undefined
  const [timeout, setTimeoutValue] = useState(profile?.streamIdleTimeoutMs ?? 300000)
  const [key, setKey] = useState('')
  const [busy, setBusy] = useState(false)
  const [revision, setRevision] = useState(namespace.revision)
  const [error, setError] = useState<string>()

  const ref = row.apiKeyEnv ?? vendor.credentialRef

  const save = async (): Promise<void> => {
    if (readOnly || busy) return
    onSaving()
    setBusy(true);setError(undefined)
    try {
      const result = await operations.writeSettings(row.entry.settingsNs, [
        ...(ref && (!preserveNativeAuthentication || key.trim()) ? [{op:'set' as const,path:[...row.entry.settingsPath,'apiKeyEnv'],value:ref}] : []),
        {op:'set',path:[...row.entry.settingsPath,'streamIdleTimeoutMs'],value:timeout},
      ],revision)
      if(result.kind !== 'written') { setError(result.message);return }
      setRevision(result.view.revision)
      if(key.trim()) {
        const failure = await operations.storeCredential(ref,key.trim())
        if(failure) {setError(`${t('vendorPartialSave')} ${failure}`);return}
        setKey('')
      }
      await onSaved()
    } catch {setError(t('serviceCredentialFailed'))} finally {setBusy(false)}
  }
  return <form className={styles['vendorEditor']} onSubmit={event => {event.preventDefault();void save()}}>
    <fieldset disabled={readOnly || busy} className={styles['vendorFields']}>
      {ref && <label className={styles['field']}><span className={styles['fieldLabel']}>{t('keyInput')}</span><input className={styles['input']} type="password" aria-label={t('keyInput')} autoComplete="new-password" value={key} onChange={event => setKey(event.target.value)} /><span className={styles['vendorMeta']}>{t('vendorKeyHelp')}</span></label>}
      <details className={styles['vendorAdvanced']}><summary>{t('advancedSettings')}</summary><label className={styles['field']}><span className={styles['fieldLabel']}>{t('connectionTimeoutSeconds')}</span><input className={styles['input']} type="number" required min={1} max={3600} step={1} value={timeout / 1000} onChange={event => setTimeoutValue(Number(event.target.value) * 1000)} /></label></details>
    </fieldset>
    {error && <p role="alert" className={styles['error']}>{error}</p>}
    <div className={styles['vendorEditorActions']}><button className={styles['secondaryButton']} disabled={busy} type="button" onClick={onCancel}>{t('cancel')}</button><button className={styles['primaryButton']} disabled={readOnly || busy} type="submit">{busy ? t('applying') : t('saveConnection')}</button></div>
  </form>
}
