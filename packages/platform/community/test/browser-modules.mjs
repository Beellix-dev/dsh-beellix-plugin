/** 浏览器夹具仅替代宿主组件表；实际页面、控制器和 HTTP 资源服务使用打包产物。 */
export async function browserModules(page) {
  await page.evaluate(() => {
    const jsx = (type, props, key) => React.createElement(type, { ...props, ...(key === undefined ? {} : { key }) })
    const button = ({ children, icon, size, variant, ...props }) => React.createElement('button', props, icon, children)
    const modal = ({ open, title, children, footer, onClose, closeLabel, className }) => !open ? null : ReactDOM.createPortal(React.createElement('div', { role: 'dialog', 'aria-label': title, className }, React.createElement('h2', null, title), React.createElement('button', { onClick: onClose }, closeLabel), children, footer), document.body)
    const base = { Button: button, Input: props => React.createElement('input', props), Modal: modal, Switch: ({ checked, onChange, label, disabled, title }) => React.createElement('button', { role: 'switch', 'aria-label': label, 'aria-checked': checked, disabled, title, onClick: () => onChange(!checked) }, label), MarkdownText: ({ text, children }) => React.createElement('div', null, text, children) }
    base.Tooltip=({children})=>children
    base.Menu=({open,onSelect,onClose,items=[],anchor,children})=>{React.useEffect(()=>{if(!open)return;const close=e=>{if(e.key==='Escape')onClose?.()};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close)},[open,onClose]);return React.createElement(React.Fragment,null,anchor,open?React.createElement('div',{role:'menu'},...items.map(item=>React.createElement('button',{key:item.id,role:'menuitem',onClick:()=>onSelect(item.id)},item.label)),children):null)}
    const primitives = new Proxy(base, { get: (target, key) => key in target ? target[key] : props => React.createElement('svg', { 'aria-hidden': true, width: props?.size ?? 16, height: props?.size ?? 16 }) })
    window.moduleRequire = name => { if (name === 'react') return React; if (name === 'react-dom') return ReactDOM; if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: React.Fragment }; if (name === '@deepseek-ai/dsh-client-ui-primitives') return primitives; throw Error('unexpected module: ' + name) }
  })
}
