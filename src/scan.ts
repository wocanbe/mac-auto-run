import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'
import { plist2json } from 'plist2'

const a = {
  a: '/Library/StartupItems/',
  b: '/System/Library/StartupItems/',
  c: '/Library/Preferences/',
  d: '/Library/LaunchAgents/',
  e: '/System/Library/LaunchAgents/',
  f: process.env.HOME + '/Library/LaunchAgents/',
  g: '/Library/LaunchDaemons/',
  h: '/System/Library/LaunchDaemons/'
}
const b: string[] = [
  '^com\.apple\..*',
  '^com\.openssh\..*',
]
const c: string[] = [
  a.c + '.GlobalPreferences.plist',
  a.c + 'org.cups.printers.plist',
  a.h + 'bootps.plist',
  a.h + 'com.vix.cron.plist',
  a.h + 'org.apache.httpd.plist',
  a.h + 'org.cups.cups-lpd.plist',
  a.h + 'org.cups.cupsd.plist',
  a.h + 'org.net-snmp.snmpd.plist',
  a.h + 'org.openldap.slapd.plist',
  a.h + 'ntalk.plist',
  a.h + 'ssh.plist',
  a.h + 'tftp.plist',
  a.f + 'com.google.keystone.agent.plist',
  a.g + 'com.oracle.oss.mysql.mysqld.plist',
  a.g + 'com.docker.vmnetd.plist'
]

function d () {
  const flists:[string, string][] = []
  for (const item in a) {
    const dirPath = a[item]
    const list = readdirSync(dirPath)
    list.forEach(fileName => {
      const filePath = join(dirPath, fileName)
      const stats = statSync(filePath)
      if (stats.isFile()) {
        if (!c.includes(filePath)) {
          for (const regStr of b) {
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
export function check () {
  const plists = d()
  const autoRuns: string[] = []
  for (const plist of plists) {
    const dirPath = a[plist[1]]
    const readPath = dirPath + plist[0]
    const fileCfg = { encoding: 'utf8' as BufferEncoding }
    try {
      const plistData = readFileSync(readPath, fileCfg)
      const jsonData = plist2json(plistData)
      const plistCfg = JSON.parse(jsonData)
      let isAutoRun = !1
      if (plistCfg.RunAtLoad) isAutoRun = !0
      if (plistCfg.OnDemand) isAutoRun = !0
      if (plistCfg.KeepAlive) isAutoRun = !0
      if (isAutoRun) {
        // 为了避免问题，不在这儿做修改，请手动修改
        autoRuns.push(readPath)
      }
    } catch (e) {
      console.log('read failure', readPath)
    }
  }
  console.log(autoRuns)
}
