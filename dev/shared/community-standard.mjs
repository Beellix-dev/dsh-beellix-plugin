/** Edition-specific documentation projection; runtime contracts remain unchanged. */
export function communityReference(source) {
  const text=source.replaceAll('企业业务','业务').replaceAll('企业应用','业务应用')
  return text.split(/\r?\n\s*\r?\n/u).filter(block=>!/enterprise|企业/iu.test(block)).join('\n\n').trim()+'\n'
}
