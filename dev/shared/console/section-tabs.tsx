import React from 'react';
export function SectionTabs({label,items,active,onChange,buttons=false,disabled=false}:{label:string;items:readonly (readonly string[])[];active:string;onChange:(id:string)=>void;buttons?:boolean;disabled?:boolean}){
 return <nav className="beellix-section-tabs" aria-label={label}>{items.map(([id,title])=>buttons?<button className="beellix-section-tab" key={id} type="button" disabled={disabled} aria-pressed={active===id} aria-current={active===id?'page':undefined} onClick={()=>onChange(id)}>{title}</button>:<a className="beellix-section-tab" key={id} href={'#beellix-'+id} aria-current={active===id?'page':undefined} onClick={e=>{e.preventDefault();onChange(id)}}>{title}</a>)}</nav>;
}
