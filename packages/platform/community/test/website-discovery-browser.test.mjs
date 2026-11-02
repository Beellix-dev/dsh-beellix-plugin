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
test('发现页在DSH内读取官网数据、搜索和详情；错误可重试，安装需确认，不打开外部网站',async()=>{
 const browser=await chromium.launch(safeChromiumOptions({...process.platform==='win32'?{channel:'msedge'}:{},headless:true}))
 try{
  const page=await browser.newPage({viewport:{width:1280,height:850}}),errors=[];page.setDefaultTimeout(5000);page.on('pageerror',error=>errors.push(error.message))
  await page.route('http://discovery.test/**',route=>route.fulfill({contentType:'text/html',body:'<html><body style="margin:0;font:14px system-ui"><div id="root"></div></body></html>'}));await page.goto('http://discovery.test/')
  for(const pkg of ['react','react-dom'])await page.addScriptTag({path:join(dirname(require.resolve(pkg+'/package.json')),'umd/'+pkg+'.development.js')})
  await browserModules(page);await browserTheme(page)
  for(const file of ['../lib/console.css','../src/style.css','../src/market.css','../../../../dev/shared/console/section-tabs.css'])await page.addStyleTag({content:readFileSync(new URL(file,import.meta.url),'utf8')})
  await page.addScriptTag({content:`window.face={exports:{}};(function(require,module,exports){${readFileSync(process.env.BEELLIX_CONSOLE_ARTIFACT??new URL('../lib/console-client.cjs',import.meta.url),'utf8')}\n})(moduleRequire,face,face.exports)`})
  await page.evaluate(()=>{
   window.opens=[];window.open=(...args)=>opens.push(args);window.actions=[];window.offline=true
   const local=[{id:'local',name:'@local/only',title:'本机独有插件',category:'tools',state:'enabled',version:'1.0.0'}]
   window.webPlugin={id:'web-one',name:'官网专属插件',packageName:'@publisher/web-only',category:'tools',summary:'官网已公开的测试插件',version:'1.0.0',license:'MIT',resourceKind:'plugin',permissions:['读写当前工作区文件'],releases:[]}
   const api={read:async path=>{if(path==='state')return{applications:local};if(path.startsWith('discovery/plugins/'))return webPlugin;if(path.startsWith('discovery?')){if(offline)throw Error('暂时无法连接官网插件目录，请稍后重试。');const q=new URL('http://local/'+path).searchParams.get('q');return{items:!q||webPlugin.name.includes(q)?[webPlugin]:[],total:!q||webPlugin.name.includes(q)?1:0,nextOffset:null}}throw Error('Unexpected read '+path)},mutate:async(path,input)=>{actions.push({path,input});if(path==='discovery/preview')return{plugin:webPlugin,confirmation:{id:webPlugin.id,name:webPlugin.packageName,version:webPlugin.version}};if(path==='discovery/install'){local.push({id:'web-only',name:webPlugin.packageName,title:webPlugin.name,category:'tools',state:'enabled',version:webPlugin.version});return{application:'applied'}}throw Error('Unexpected mutate '+path)}}
   ReactDOM.createRoot(document.querySelector('#root')).render(React.createElement(face.exports.ApplicationManager,{api,embedded:true}))
  })
  await page.getByRole('button',{name:'发现',exact:true}).click()
  await page.getByRole('alert').filter({hasText:'暂时无法连接官网插件目录'}).waitFor()
  assert.equal(await page.getByRole('heading',{name:'本机独有插件',exact:true}).count(),0)
  assert.equal(await page.getByRole('link',{name:'发现',exact:true}).count(),0)
  await page.evaluate(()=>{offline=false});await page.getByRole('button',{name:'重试',exact:true}).click()
  await page.getByRole('heading',{name:'官网专属插件',exact:true}).waitFor()
  const captures=join(import.meta.dirname,'../../../../dev/artifacts/test-results/website-discovery-20261102');mkdirSync(captures,{recursive:true})
  for(const width of [360,1280])for(const dark of [false,true]){await page.setViewportSize({width,height:850});await page.evaluate(dark=>document.body.toggleAttribute('data-ds-dark-theme',dark),dark);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);await page.screenshot({path:join(captures,`${width}-${dark?'dark':'light'}.png`)})}
  await page.getByRole('searchbox',{name:'搜索官网插件'}).fill('不存在');await page.getByText('没有匹配的官网插件',{exact:true}).waitFor()
  await page.getByRole('searchbox',{name:'搜索官网插件'}).fill('官网');await page.getByRole('button',{name:'查看官网插件 官网专属插件'}).click()
  await page.getByRole('heading',{name:'插件信息',exact:true}).waitFor();await page.getByText('读写当前工作区文件',{exact:true}).waitFor()
  await page.getByRole('button',{name:'检查安装包',exact:true}).click();await page.getByRole('button',{name:'确认安装',exact:true}).waitFor()
  assert.equal(await page.evaluate(()=>actions.filter(row=>row.path==='discovery/install').length),0)
  await page.getByRole('button',{name:'取消',exact:true}).click();assert.equal(await page.evaluate(()=>actions.filter(row=>row.path==='discovery/install').length),0)
  await page.getByRole('button',{name:'检查安装包',exact:true}).click();await page.getByRole('button',{name:'确认安装',exact:true}).click()
  await page.getByRole('button',{name:'已安装',exact:true}).waitFor();await page.getByRole('heading',{name:'官网专属插件',exact:true}).waitFor()
  assert.deepEqual(await page.evaluate(()=>opens),[]);assert.deepEqual(errors,[])
 }finally{await browser.close()}
})
