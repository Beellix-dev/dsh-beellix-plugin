/** 技能目录按来源展示；会话诊断只通过明确的详情入口进入。 */
import { useState } from 'react'
import { Button, Input, IconChevronDownOutline14 } from '@beellix-ai/ui-components'
import type { AdminState } from './controller.ts'
import type { AdminKey } from './locales.ts'
import { sessionName } from './readable.ts'
import css from './admin.module.css'

export function SkillDirectory({ state, t, read }: { state: AdminState; t: (key: AdminKey) => string; read?: ((scope:string,name:string)=>Promise<unknown>) | undefined }) {
  const [query, setQuery] = useState(''), [source, setSource] = useState('all')
  const [content,setContent]=useState<Record<string,string>>({}),[reading,setReading]=useState<string>(),[failed,setFailed]=useState<string>()
  const [variants, setVariants] = useState<Record<string, string>>({})
  if (state.busy) return <p role="status">{t('loading')}</p>
  if (state.error || state.skillsError || state.detail && state.sessionsError) return <p role="alert">{t(state.skillsError === 'forbidden' || state.detail && state.sessionsError === 'forbidden' ? 'native.operator' : 'error.load')}</p>
  const diagnostic = !!state.detail
  const session = state.sessions?.find(row => row.id === state.detail)
  const groups = new Map<string, NonNullable<AdminState['skills']>[number][]>()
  for (const skill of state.skills ?? []) {
    const key = !diagnostic && skill.environment ? JSON.stringify([skill.displayName ?? skill.name, skill.provider, skill.description, skill.modelInvocable, skill.userInvocable]) : skill.id ?? skill.name
    groups.set(key, [...groups.get(key) ?? [], skill])
  }
  const skills = [...groups].filter(([, rows]) => (diagnostic || source === 'all' || rows[0]!.source === source) && rows.some(skill => [skill.name,skill.displayName,skill.description,skill.provider,...skill.scopes??[]].join(' ').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())))
  return <section aria-label={t('inventory.skills')}>
    {diagnostic && <div className={css.consolePanelHeading}><h2>{t(diagnostic ? 'inventory.skillsDiagnostic' : 'inventory.skills')}</h2>{diagnostic && <a href="/admin/skills" className={css.consoleLink}>{t('inventory.skillsBack')}</a>}</div>}
    {diagnostic && <p className={css.inventoryNote}>{session ? sessionName(session,t) : t('inventory.skillsSession')}</p>}
    <div className={css.inventoryFilters}>
      <label>{t('inventory.skillsSearch')}<Input type="search" value={query} onChange={event => setQuery(event.target.value)} /></label>
      {!diagnostic && <label>{t('inventory.skillsSource')}<select value={source} onChange={event=>setSource(event.target.value)}>{['all','platform','tool','plugin','workspace'].map(value=><option key={value} value={value}>{t(value === 'all' ? 'inventory.all' : ('inventory.skillsSource.'+value) as AdminKey)}</option>)}</select></label>}
    </div>
    {state.skillsIncomplete && <p role="status">{t('inventory.skillsIncomplete')}</p>}
    <p className={css.inventoryCount}>{t('inventory.skillsCount').replace('{count}',String(skills.length))}</p>
    {skills.length === 0 ? <p className={css.empty}>{t(query || source !== 'all' ? 'inventory.skillsNoMatch' : diagnostic ? 'inventory.skillsEmpty' : 'inventory.skillsCatalogEmpty')}</p> :
      <div className={css.skillGrid}>{skills.map(([group, rows]) => {
        const skill = rows.find(row => (row.id ?? row.name) === variants[group]) ?? rows[0]!
        const id=skill.id??skill.name, scope=state.detail??'catalog', key=scope+':'+id
        return <details key={group} className={[css.inventoryCard,css.skillCard].join(" ")}>
          <summary className={css.inventoryCardToggle}><span className={css.skillSummary}><strong>{skill.displayName ?? skill.name}</strong><span className={css.skillDescription}>{skill.description}</span>{!diagnostic&&<small className={css.skillSourceTag}>{t(('inventory.skillsSource.'+(skill.source??'platform')) as AdminKey)}</small>}</span><IconChevronDownOutline14 className={css.inventoryChevron} /></summary>
          <div className={css.inventoryDetails}>
            {rows.length > 1 && <label className={css.catalogField}>{t('inventory.skillEnvironment')}<select value={id} disabled={!!reading} onChange={event => setVariants(current => ({...current, [group]:event.target.value}))}>{rows.map((row, index) => <option key={row.id ?? row.name} value={row.id ?? row.name}>{t(row.environment === 'cloud' ? 'inventory.skillCloud' : 'inventory.skillClient')}{rows.filter(item => item.environment === row.environment).length > 1 ? ` ${index + 1}` : ''}</option>)}</select></label>}
            {skill.whenToUse && <p>{skill.whenToUse}</p>}
            <details className={css.skillTechnical}><summary>{t('console.technical')}</summary><dl>
              {!diagnostic && <>{skill.provider && skill.source==='plugin' && <><dt>{t('inventory.skillsSource')}</dt><dd>{skill.provider}</dd></>}
              <dt>{t('inventory.skillsApplies')}</dt><dd>{skill.scopes?.join('、') || t('inventory.skillsSource.platform')}</dd></>}
              <dt>{t('inventory.skillsInvocation')}</dt><dd>{t(skill.modelInvocable ? skill.userInvocable === false ? 'inventory.skillsOnlyModel' : 'inventory.skillsModel' : skill.userInvocable === false ? 'inventory.skillsNeither' : 'inventory.skillsUser')}</dd>
              {skill.path && <><dt>{t('inventory.source')}</dt><dd><code>{skill.path}</code></dd></>}
            </dl></details>
            {read && <Button variant="outline" size="sm" disabled={!!reading} onClick={()=>{setReading(key);setFailed(undefined);void read(scope,id).then(value=>{if(!value||typeof value!=='object'||!('content'in value)||typeof value.content!=='string')throw Error();setContent(current=>({...current,[key]:value.content as string}))}).catch(()=>setFailed(key)).finally(()=>setReading(undefined))}}>{t('inventory.skillsRead')}</Button>}
            {failed===key&&<p role="alert">{t('error.load')}</p>}
            {content[key]!==undefined&&<pre className={css.skillContent}>{content[key]}</pre>}
          </div>
        </details>
      })}</div>}
  </section>
}
