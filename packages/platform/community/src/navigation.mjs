/** Next 尚无“更多”条目贡献槽：用公开槽位锚点扩展原菜单，不替换账户或插件业务逻辑。 */
export function installMoreNavigation({ document, onOpen, t, logo }) {
  const window = document.defaultView
  const saved = new Map()
  const groups = new Set()
  let disposed = false, frame = 0
  const footerButtons = () => [...document.querySelectorAll('[data-slot="sidebar.footer.action"] button')]
  const sourceOf = id => footerButtons().find(button => id === 'market'
    ? button.querySelector('[data-icon="market-store"]') || button.classList.contains('dshMarketLauncher')
    : ['远程控制', 'Remote Control', '手机连接', 'Mobile connection', 'Agents Anywhere'].includes(button.getAttribute('aria-label')))
  const icon = id => {
    if(id==='nav'&&logo){const image=document.createElement('img');image.src=logo;image.alt='';image.width=16;image.height=16;image.draggable=false;image.setAttribute('aria-hidden','true');return image}
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    for (const [key, value] of Object.entries({ width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' })) svg.setAttribute(key, value)
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', id === 'market' ? 'M4 9v11h16V9M3 9l2-6h14l2 6M3 9q3 4 6 0 3 4 6 0 3 4 6 0M9 20v-7h6v7' : id === 'remote' ? 'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2M11 18h2' : 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z')
    svg.append(path); return svg
  }
  const sync = () => {
    frame = 0
    if (disposed) return
    for (const group of groups) if (!group.isConnected) groups.delete(group)
    for (const button of saved.keys()) if (!button.isConnected) saved.delete(button)
    const launcher = document.querySelector('[data-slot="settings.launcher"] button[aria-haspopup="menu"], [data-slot="settings.launcher"] button[aria-expanded]')
    // 宿主没有原“更多”菜单时保留原入口，避免形成无法找回的隐藏动作。
    if (!launcher) {
      for (const [button, original] of saved) {
        if (original.value) button.style.setProperty('display', original.value, original.priority)
        else button.style.removeProperty('display')
      }
      saved.clear(); return
    }
    for (const id of ['market', 'remote']) {
      const source = sourceOf(id)
      if (source && !saved.has(source)) {
        saved.set(source, { value: source.style.getPropertyValue('display'), priority: source.style.getPropertyPriority('display') })
        source.style.setProperty('display', 'none', 'important')
      }
    }
    if (launcher.getAttribute('aria-expanded') !== 'true') return
    const menus = [...document.querySelectorAll('[role="menu"]')].filter(menu => menu.querySelector('button[role="menuitem"]') && !menu.closest('[data-beellix-more]'))
    if (menus.length !== 1) return
    const menu = menus[0], viewport = menu.querySelector(':scope > [role="presentation"]') ?? menu
    let group = menu.querySelector('[data-beellix-more]')
    if (!group) {
      group = document.createElement('div'); group.dataset.beellixMore = ''; group.setAttribute('role', 'presentation')
      group.className = 'beellix-more-group'; groups.add(group); viewport.append(group)
    }
    const entries = ['nav', ...sourceOf('market') ? ['market'] : [], ...sourceOf('remote') ? ['remote'] : []]
    for (const id of entries) {
      let button = group.querySelector(`[data-beellix-action="${id}"]`)
      if (!button) {
        button = document.createElement('button'); button.type = 'button'; button.setAttribute('role', 'menuitem'); button.tabIndex = -1
        button.dataset.beellixAction = id; button.className = 'beellix-more-item'
        button.append(icon(id), document.createElement('span'))
        button.addEventListener('click', event => {
          event.stopPropagation()
          const source = id === 'nav' ? undefined : sourceOf(id)
          launcher.click()
          window.requestAnimationFrame(() => { if (!disposed) { if (id === 'nav') onOpen(); else source?.click() } })
        })
        group.append(button)
      }
      const label = t(id)
      if (button.lastElementChild.textContent !== label) button.lastElementChild.textContent = label
      button.disabled = id !== 'nav' && Boolean(sourceOf(id)?.disabled)
    }
    for (const button of group.querySelectorAll('button')) if (!entries.includes(button.dataset.beellixAction)) button.remove()
  }
  const schedule = () => { if (!disposed && !frame) frame = window.requestAnimationFrame(sync) }
  const observer = new window.MutationObserver(schedule)
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-expanded'] })
  sync()
  return () => {
    disposed = true; observer.disconnect(); window.cancelAnimationFrame(frame)
    for (const group of groups) group.remove()
    for (const [button, original] of saved) {
      if (original.value) button.style.setProperty('display', original.value, original.priority)
      else button.style.removeProperty('display')
    }
  }
}
