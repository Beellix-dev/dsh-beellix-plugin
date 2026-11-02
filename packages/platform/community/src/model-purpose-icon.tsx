import React from 'react'

/** 按插件声明的操作类型选择图标；所有插件共用同一套几何和主题。 */
export function ModelPurposeIcon({operation='chat'}:{operation?:string}){
 const drawings:Record<string,React.ReactNode>={
  chat:<><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-8M8 12h5M8 16h7"/><path d="m18 2 .9 2.6L21.5 5.5l-2.6.9L18 9l-.9-2.6-2.6-.9 2.6-.9L18 2Z"/></>,
  embedding:<><circle cx="6" cy="6" r="2"/><circle cx="6" cy="17" r="2"/><circle cx="15" cy="6" r="2"/><path d="M8 6h5M6 8v7m2 2h3M7.5 7.5l5.5 5.5"/><circle cx="16" cy="16" r="4"/><path d="m19 19 2 2"/></>,
  parse:<><path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3M8 8h8M8 12h8M8 16h5"/></>,
  rerank:<><path d="M4 6h8M4 12h6M4 18h4M18 4v15m-3-3 3 3 3-3"/><circle cx="12" cy="18" r=".6" fill="currentColor" stroke="none"/></>,
 }
 return <span className="beellix-model-purpose-icon" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">{drawings[operation]??drawings.chat}</svg></span>
}
