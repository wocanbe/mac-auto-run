import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs'
import { join, resolve } from 'path'
import { js2plist, plist2json } from 'plist2'
import { whiteList, whiteReg, items } from './config'
import { lang } from './i18n'

const fileCfg = { encoding: 'utf8' as BufferEncoding }
type plistCfg = {
  type: string,
  name: string,
  path: string,
  code?: string
}
function getRawType (val: unknown):string {
  return Object.prototype.toString.call(val).slice(8, -1)
}
function isObj(obj:unknown):obj is object {
  return getRawType(obj) === 'Object'
}
function isBool (val:unknown):val is boolean {
  return val === true || val === false
}
function checkAndGetCode (filePath: string) {
  let oldData: string, plistCfg: any
  try {
    const plistData = readFileSync(filePath, fileCfg)
    oldData = plist2json(plistData)
    plistCfg = JSON.parse(oldData)
  } catch (e) {
    console.log('read failure', filePath)
    return
  }
  if (plistCfg.RunAtLoad) return oldData
  if (plistCfg.OnDemand) return oldData
  if (plistCfg.KeepAlive===true) {
    return oldData
  } else if (isObj(plistCfg.KeepAlive)) {
    return oldData
  }
}
function scanPlists () {
  const flists:plistCfg[] = []
  for (const item in items) {
    const dirPath = items[item]
    const list = readdirSync(dirPath)
    list.forEach(fileName => {
      const filePath = join(dirPath, fileName)
      const stats = statSync(filePath)
      if (stats.isFile()) {
        if (!whiteList.includes(filePath)) {
          for (const regStr of whiteReg) {
            const reg = new RegExp(regStr, 'i')
            if (reg.test(fileName)) return
          }
          // console.log([item, fileName])
          flists.push({
            type: item,
            name: fileName,
            path: filePath
          })
        }
      }
    })
  }
  return flists.sort((a, b) => a.name.localeCompare(b.name))
}
export function scan () {
  const plists = scanPlists()
  const autoRuns = []
  for (const plist of plists) {
    const code = checkAndGetCode(plist.path)
    if (code) autoRuns.push(plist.path)
  }
  if (autoRuns.length) {
    console.log(lang.tips, autoRuns)
  } else {
    console.log(lang.notFound)
  }
}
export function edit (prodCfg: any) {
  const plists = scanPlists()
  for (const plist of plists) {
    const oldCode = checkAndGetCode(plist.path)
    if (oldCode) {
      const newCode = editPlist(oldCode, prodCfg)
      if (newCode) {
        const backPath = plist.type + '/' + plist.name
        console.log(`${lang.backup} ${plist.path}`)
        writeFileSync(resolve('backup/' + backPath + '.json'), oldCode, fileCfg)
        writeFileSync(plist.path, newCode, fileCfg)
      }
    }
  }
}
function editPlist (oldData: string, auth: any) {
  const plistCfg = JSON.parse(oldData)
  let isEdit = false
  if (plistCfg.RunAtLoad && auth.RunAtLoad === false) {
    plistCfg.RunAtLoad = auth.RunAtLoad
    isEdit = true
  }
  if (plistCfg.OnDemand && auth.OnDemand === false) {
    plistCfg.OnDemand = auth.OnDemand
    isEdit = true
  }
  if (plistCfg.KeepAlive===true) {
    if (auth.KeepAlive===false) {
      plistCfg.KeepAlive = auth.KeepAlive
      isEdit = true
    }
  } else if (isObj(plistCfg.KeepAlive)) {
    if (auth.SuccessfulExit === false && isBool(plistCfg.KeepAlive.SuccessfulExit)) {
      delete plistCfg.KeepAlive.SuccessfulExit
      isEdit = true
      if (JSON.stringify(delete plistCfg.KeepAlive) === '{}') delete plistCfg.KeepAlive
    }
  }
  if (isEdit) {
    return js2plist(plistCfg)
  }
}
