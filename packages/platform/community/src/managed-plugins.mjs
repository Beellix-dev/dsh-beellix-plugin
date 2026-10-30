/** 保留原生加载登记，只收起经中台校验归属的重复管理入口；停用 UI 可恢复。 */
export function installManagedPluginNavigation({document,packages,open}) {
  const names=new Set(packages),saved=new Map(),guidance=new Map(),window=document.defaultView
  let frame=0,disposed=false
  const restore=node=>{const value=saved.get(node);if(!value)return;node.hidden=value.hidden;if(value.display)node.style.setProperty('display',value.display,value.priority);else node.style.removeProperty('display');saved.delete(node)}
  const hide=node=>{if(!saved.has(node))saved.set(node,{hidden:node.hidden,display:node.style.getPropertyValue('display'),priority:node.style.getPropertyPriority('display')});if(!node.hidden)node.hidden=true;if(node.style.display!=='none')node.style.setProperty('display','none','important')}
  const sync=()=>{
    frame=0;if(disposed)return
    for(const node of saved.keys())if(!node.isConnected)saved.delete(node)
    for(const card of document.querySelectorAll('[data-plugin-panel] [data-plugin-package]'))if(names.has(card.getAttribute('data-plugin-package')))hide(card)
    for(const group of document.querySelectorAll('[data-plugin-panel] [data-plugin-group]')){
      const cards=[...group.querySelectorAll('[data-plugin-package],[data-plugin-item]')]
      if(cards.length&&cards.every(card=>saved.has(card)))hide(group);else if(saved.has(group))restore(group)
    }
    for(const detail of document.querySelectorAll('[data-plugin-panel] [data-plugin-detail]')){
      if(!names.has(detail.getAttribute('data-plugin-detail')))continue
      // 旧链接仍可到达原生详情时，不再留下第二套启停／卸载操作。
      for(const child of detail.children)if(!child.hasAttribute('data-beellix-managed-entry'))hide(child)
      if(!guidance.has(detail)){
        const section=document.createElement('section');section.dataset.beellixManagedEntry='';section.className='beellix-managed-entry'
        const text=document.createElement('p');text.textContent='此插件由 Beelli X 中台管理。'
        const button=document.createElement('button');button.type='button';button.textContent='打开插件管理';button.addEventListener('click',open)
        section.append(text,button);detail.append(section);guidance.set(detail,section)
      }
    }
  }
  const observer=new window.MutationObserver(()=>{if(!disposed&&!frame)frame=window.requestAnimationFrame(sync)})
  observer.observe(document.body,{childList:true,subtree:true});sync()
  return()=>{disposed=true;observer.disconnect();window.cancelAnimationFrame(frame);for(const node of [...saved.keys()])restore(node);for(const section of guidance.values())section.remove()}
}
