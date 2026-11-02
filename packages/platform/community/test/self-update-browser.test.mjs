import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,mkdirSync} from 'node:fs'
import {createRequire} from 'node:module'
import {dirname,join} from 'node:path'
import {chromium} from 'playwright'
import {safeChromiumOptions} from '../../../../dev/scripts/browser-launch-options.mjs'
import {browserModules} from './browser-modules.mjs'
import {browserTheme} from './browser-theme.mjs'
const require=createRequire(import.meta.url)
const client=readFileSync(process.env.BEELLIX_SELF_UPDATE_CLIENT??new URL('../lib/client.js',import.meta.url),'utf8')
function factory(name){const marker=JSON.stringify('./'+name)+':(require)=>{',start=client.indexOf(marker),end=client.indexOf('\nreturn module.exports;}',start);assert.ok(start>=0&&end>start,'安装包缺少 '+name);return client.slice(start+marker.length,end)+'\nreturn module.exports;'}
test('最终客户端首页原位检查、同版更新与重启，支持失败重试、键盘及宽窄日夜',async()=>{
 const browser=await chromium.launch(safeChromiumOptions({channel:'msedge',headless:true}))
 try{
  const page=await browser.newPage({viewport:{width:1366,height:850}}),errors=[];page.on('pageerror',error=>errors.push(error.message));page.setDefaultTimeout(3500)
  await page.setContent('<html lang="zh"><head></head><body style="margin:0"><div id="root"></div></body></html>')
  for(const pkg of ['react','react-dom'])await page.addScriptTag({path:join(dirname(require.resolve(pkg+'/package.json')),'umd/'+pkg+'.development.js')})
  await browserModules(page);await browserTheme(page);await page.addStyleTag({content:readFileSync(new URL('../src/style.css',import.meta.url),'utf8')+'\nhtml,body,#root{height:100%;background:var(--dsw-alias-bg-base);font-family:system-ui}'} )
  await page.evaluate(factories=>{
   const modules={},load=id=>modules[id]??moduleRequire(id)
   for(const [name,source]of Object.entries(factories))modules['./'+name]=new Function('require',source)(load)
   window.calls=[];window.mode='available';window.api={read:async()=>({status:'unchecked'}),mutate:async(action,input)=>{calls.push({action,input});if(mode==='offline')throw Error('暂时无法连接 GitHub，请检查网络后重试。');if(action==='check')return{status:mode,commit:'a'.repeat(40),version:'0.1.1'};if(action==='install'){await new Promise(r=>{window.finish=r});return{status:'restart-required',canRestart:true}}return{status:'restart-required',canRestart:true}}}
   window.generation=0;window.renderHome=()=>ReactDOM.render(React.createElement(modules['./panel.mjs'].BootstrapView,{key:++generation,snapshot:{status:'ready',root:'D:\\DSH\\DSH NEXT\\Beellix',version:'0.1.1',directories:[]},selfUpdateApi:api,t:key=>modules['./panel.mjs'].zh[key]??key}),document.getElementById('root'))
   renderHome()
  },{'operation-feedback.mjs':factory('operation-feedback.mjs'),'self-update-control.mjs':factory('self-update-control.mjs'),'console-icons.mjs':factory('console-icons.mjs'),'account-control.mjs':factory('account-control.mjs'),'panel.mjs':factory('panel.mjs')})
  await page.getByRole('button',{name:'检查更新',exact:true}).click();await page.getByRole('button',{name:'立即更新',exact:true}).waitFor()
  const out=new URL('../../../../dev/artifacts/community-self-update-20261102/browser/',import.meta.url);mkdirSync(out,{recursive:true});await page.screenshot({path:join(out.pathname.replace(/^\/([A-Z]:)/,'$1'),'home-wide.png')})
  await page.getByRole('button',{name:'立即更新',exact:true}).click();await page.getByRole('button',{name:'正在更新…',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'正在更新…',exact:true}).isDisabled(),true)
  await page.evaluate(()=>finish());await page.getByRole('button',{name:'重启生效',exact:true}).click()
  assert.deepEqual(await page.evaluate(()=>calls.map(row=>row.action)),['check','install','restart'])
  await page.evaluate(()=>{mode='offline';renderHome()});await page.getByRole('button',{name:'检查更新',exact:true}).click();await page.getByRole('alert').filter({hasText:'暂时无法连接 GitHub'}).waitFor()
  await page.evaluate(()=>{mode='available'});await page.getByRole('button',{name:'检查更新',exact:true}).focus();await page.keyboard.press('Enter');await page.getByRole('button',{name:'立即更新',exact:true}).waitFor()
  await page.setViewportSize({width:420,height:850});await page.evaluate(()=>document.body.toggleAttribute('data-ds-dark-theme',true));await page.screenshot({path:join(out.pathname.replace(/^\/([A-Z]:)/,'$1'),'home-narrow-dark.png')})
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
  assert.equal(await page.locator('input').count(),0);assert.deepEqual(errors,[])
 }finally{await browser.close()}
})
