const i18n: {[key: string]: any} = {
  'en_us': {
    msg: 'Please select a option.(tip: if you choose to forbid autorun, please close that software first)',
    exit: 'exit',
    scan: 'scan ',
    ban: 'forbid ',
    autorun: ' autorun',
    tips: 'These software have autorun behavior',
    notFound: 'Not found',
    backup: 'backup '
  },
  'zh_cn': {
    msg: '请选择要进行的操作(提示:选择禁止自动运行，请先关闭相关软件)',
    exit: '退出',
    scan: '扫描',
    ban: '禁止',
    autorun: '自动运行',
    tips: '这些软件存在自动启动行为',
    notFound: '没有发现',
    backup: '备份'
  }
}
function getLang ():any {
  if (process.env.LANG) {
    const local = process.env.LANG.split('.')[0].toLowerCase()
    const langCfg = i18n[local]
    if (langCfg) return langCfg
  }
  return i18n['en-us']
}
export const lang = getLang()
