/** 沿用中台侧栏的细线图形，所有页面共享同一套视觉语义。 */
import React from 'react'
const paths = {
 account:'M15.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0ZM5 21v-2a7 7 0 0 1 14 0v2',
 home:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
 models:'M8 3v3m8-3v3M8 18v3m8-3v3M3 8h3m-3 8h3m12-8h3m-3 8h3M6 6h12v12H6z',
 scenarios:'M3 3h6v6H3zM15 15h6v6h-6zM6 9v9h9M15 3h6v6h-6zM18 9v6',
 resources:'M12 5C9 2 4 3 2 4v16c3-2 7-2 10 0 3-2 7-2 10 0V4c-3-1-7-2-10 1v15',
 integrations:'M9 7H7a5 5 0 0 0 0 10h2m6-10h2a5 5 0 0 1 0 10h-2M8 12h8',
 data:'M21 6c0 2-4 3-9 3S3 8 3 6s4-3 9-3 9 1 9 3ZM3 6v12c0 2 4 3 9 3s9-1 9-3V6M3 12c0 2 4 3 9 3s9-1 9-3',
 archives:'M3 4h18v4H3V4Zm2 4v12h14V8M9 12h6',
 chat:'M4 3h16v14H9l-5 4V3Z',
 operations:'M3 12h4l3-8 4 16 3-8h4',
 tasks:'M9 4h11v17H4V4h2m1-2h8v4H7V2Zm1 9 2 2 4-4m-6 8h8',
 branch:'M6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 0v8m0 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0-8h8a4 4 0 0 0 4-4V4m0 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
 folder:'M3 7V5h6l2 2h10v13H3V7Zm0 3h18',
 plugins:'M9 3h6v4h4v6h-4v7H9v-7H5V7h4V3Z',
 settings:'M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-5 0v6',
 prices:'M4 4h16v16H4V4Zm4 4 4 4 4-4m-4 4v6m-4-5h8m-8 3h8',
 balance:'M4 6h15v14H4V6Zm0 0V4h13v2m-1 5h5v5h-5v-5Zm2 2.5h.01',
 usage:'M5 20V10m7 10V4m7 16v-7M3 20h18',
 skills:'m12 3 9 5-9 5-9-5 9-5Zm-7 9v5l7 4 7-4v-5',
 back:'m10 5-7 7 7 7M3 12h18',panel:'M3 4h18v16H3zM9 4v16',
}
export function ConsoleIcon({kind='plugins',size=20}) {
 return React.createElement('svg',{width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.6,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true},React.createElement('path',{d:paths[kind]??paths.plugins}))
}
export function ConsoleGlyph({kind='plugins',children}) {
 return React.createElement('span',{className:'beellix-glyph','data-kind':kind,'aria-hidden':true},children??React.createElement(ConsoleIcon,{kind}))
}
