import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs'
import { join, resolve } from 'path'
import { parse, build } from 'plist'
import { whiteList, whiteReg, items, blackList } from './config'

const fileCfg = { encoding: 'utf8' as BufferEncoding }
function scan () {
  const flists:[string, string][] = []
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
          flists.push([fileName, item])
        }
      }
    })
  }
  return flists.sort((a, b) => a[0].localeCompare(b[0]))
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
function getAuth (plistName: string) {
  let auth: any = {}
  for (let i = 0; i < blackList.length; i++) {
    const item = blackList[i]
    const mode = item.mode || 'full'
    if (mode === 'full') {
      if (item.path === plistName) {
        auth = item.auth
        break
      }
    } else {
      const reg = new RegExp(item.path, 'i')
      if (reg.test(plistName)) {
        auth = item.auth
        break
      }
    }
  }
  return auth
}
function checkPlist (readPath: string, plistName: string) {
  let oldData: string, plistCfg: any
  try {
    const plistData = readFileSync(readPath, fileCfg)
    plistCfg = parse(plistData) as any
    oldData = JSON.stringify(plistCfg)
  } catch (e) {
    console.log('read failure', readPath)
    return
  }
  const auth = getAuth(plistName)
  let autoRun = false, isEdit = false
  if (plistCfg.RunAtLoad) {
    autoRun = true
    if (auth.RunAtLoad === false) {
      plistCfg.RunAtLoad = auth.RunAtLoad
      isEdit = true
    }
  }
  if (plistCfg.OnDemand) {
    autoRun = true
    if (auth.OnDemand === false) {
      plistCfg.OnDemand = auth.OnDemand
      isEdit = true
    }
  }
  if (plistCfg.KeepAlive===true) {
    autoRun = true
    if (auth.KeepAlive===false) {
      plistCfg.KeepAlive = auth.KeepAlive
      isEdit = true
    }
  } else if (isObj(plistCfg.KeepAlive)) {
    autoRun = true
    if (auth.SuccessfulExit === false && isBool(plistCfg.KeepAlive.SuccessfulExit)) {
      delete plistCfg.KeepAlive.SuccessfulExit
      isEdit = true
      if (JSON.stringify(delete plistCfg.KeepAlive) === '{}') delete plistCfg.KeepAlive
    }
  }
  if (autoRun) console.log(readPath)
  if (isEdit) {
    const newData = build(plistCfg)
    return { oldData, newData }
  }
}
function writeToFile (backPath: string, oldData: string, readPath:string, newData: string) {
  console.log(`backup ${backPath}`)
  writeFileSync(resolve('backup/' + backPath + '.json'), oldData, fileCfg)
  writeFileSync(readPath, newData, fileCfg)
}
export function check () {
  const plists = scan()
  for (const plist of plists) {
    const readPath = items[plist[1]] + plist[0]
    const datas = checkPlist(readPath, plist[0])
    if (datas) {
      const backPath = plist[1] + '/' + plist[0].slice(0, -5) + 'json'
      writeToFile(backPath, datas.oldData, readPath, datas.newData)
    }
  }
}
