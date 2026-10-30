/** 插件和目录变化共用的刷新信号，不保存或重建原生会话。 */
export function createSceneChanges({remote,events}={}){
 const listeners=new Set();let queued=false,disposed=false
 const invalidate=()=>{if(disposed||queued)return;queued=true;void Promise.resolve().then(()=>{queued=false;if(!disposed)for(const fn of listeners)fn()})}
 const off=remote?.$on?.('plugin-manager/changed',invalidate)
 for(const name of ['online','pageshow'])events?.addEventListener?.(name,invalidate)
 return{subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn)},invalidate,dispose:()=>{disposed=true;off?.();listeners.clear();for(const name of ['online','pageshow'])events?.removeEventListener?.(name,invalidate)}}
}
