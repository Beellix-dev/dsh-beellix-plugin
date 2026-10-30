/** 复用凭据 Remote 的只写服务密钥编辑器；从不请求已保存的秘密值。 */
import { useState } from 'react'
import { Button, Input } from '@beellix-ai/ui-components'
import type { CredentialInfo } from '@beellix-ai/api-remotes/client'
import type { ModelsOperations } from './operations.ts'
import type { en } from './locales.ts'
import styles from './ModelsSection.module.css'

/** @param props - 原有凭据操作、权限与本地化文案。 @returns 按引用检查、写入及确认删除的表单。 */
export function ManagedCredentialEditor({ operations, t, readOnly }: {
  operations: Pick<ModelsOperations, 'describeCredential' | 'storeCredential' | 'removeCredential'>
  t: (key: keyof typeof en) => string
  readOnly: boolean
}) {
  const [ref, setRef] = useState('')
  const [secret, setSecret] = useState('')
  const [info, setInfo] = useState<CredentialInfo>()
  const [busy, setBusy] = useState(false)
  const [removeConfirmed, setRemoveConfirmed] = useState(false)
  const [notice, setNotice] = useState<'serviceCredentialSaved' | 'serviceCredentialFailed'>()
  const valid = /^[A-Za-z_][A-Za-z0-9_]*$/.test(ref)
  const writable = !readOnly && !busy && info?.writable === true && valid
  const inspect = async () => {
    if (!valid || busy) return
    setBusy(true); setNotice(undefined); setInfo(undefined)
    try {
      const current = await operations.describeCredential(ref)
      setInfo(current)
      if (!current) setNotice('serviceCredentialFailed')
    } catch { setNotice('serviceCredentialFailed') }
    finally { setBusy(false) }
  }
  const change = async (remove: boolean) => {
    if (!writable || remove && (!removeConfirmed || !info?.configured) || !remove && !secret) return
    const value = secret
    setSecret(''); setBusy(true); setNotice(undefined); setRemoveConfirmed(false)
    try {
      const error = remove ? await operations.removeCredential(ref) : await operations.storeCredential(ref, value)
      setNotice(error === undefined ? 'serviceCredentialSaved' : 'serviceCredentialFailed')
      setInfo(await operations.describeCredential(ref))
    } catch { setNotice('serviceCredentialFailed') }
    finally { setBusy(false) }
  }
  return <section id="managed-credentials" className={styles['credentialSection']}>
    <h3 className={styles['title']}>{t('serviceCredentials')}</h3>
    <p className={styles['intro']}>{t('serviceCredentialsHelp')}</p>
    <div className={styles['credentialInspect']}>
      <label className={styles['field']}>{t('serviceCredentialRef')}<Input disabled={busy} value={ref} onChange={event => { setRef(event.target.value); setInfo(undefined); setSecret(''); setNotice(undefined); setRemoveConfirmed(false) }} /></label>
      <Button type="button" variant="outline" disabled={!valid || busy} onClick={() => void inspect()}>{t('serviceCredentialInspect')}</Button>
    </div>
    {info && <p role="status">{t(info.configured ? 'serviceCredentialPresent' : 'serviceCredentialMissing')}{info.source ? ` · ${info.source}` : ''}</p>}
    <form className={styles['credentialForm']} onSubmit={event => { event.preventDefault(); void change(false) }}>
      <label className={styles['field']}>{t('serviceCredentialValue')}<Input type="password" autoComplete="new-password" disabled={!writable} value={secret} onChange={event => setSecret(event.target.value)} /></label>
      <Button type="submit" variant="primary" disabled={!writable || !secret}>{t('serviceCredentialSave')}</Button>
    </form>
    {info?.configured && <label><input type="checkbox" disabled={!writable} checked={removeConfirmed} onChange={event => setRemoveConfirmed(event.target.checked)} />{t('serviceCredentialRemoveConfirm')}</label>}
    <Button type="button" variant="outline" disabled={!writable || !info?.configured || !removeConfirmed} onClick={() => void change(true)}>{t('serviceCredentialRemove')}</Button>
    {notice && <p role={notice === 'serviceCredentialFailed' ? 'alert' : 'status'}>{t(notice)}</p>}
  </section>
}
