type keyStr = {
  [key:string]: string
}
export type blackItem = {
  name: string,
  mode?: 'full'|'reg', // 完全匹配/正则匹配
  path: string,
  auth: {
    RunAtLoad?: boolean,
    OnDemand?: boolean,
    KeepAlive?: boolean,
    SuccessfulExit?: boolean
  } // 开机运行、后台运行、退出重启
}
export const items: keyStr = {
  startup: '/Library/StartupItems/',
  sStartup: '/System/Library/StartupItems/',
  preferences: '/Library/Preferences/',
  agents: '/Library/LaunchAgents/',
  sAgents: '/System/Library/LaunchAgents/',
  uAgents: process.env.HOME + '/Library/LaunchAgents/',
  daemons: '/Library/LaunchDaemons/',
  sDaemons: '/System/Library/LaunchDaemons/'
}
export const whiteReg: string[] = [
  '^com\.apple\..*',
  '^com\.openssh\..*',
]
export const whiteList: string[] = [
  items.preferences + '.GlobalPreferences.plist',
  items.preferences + 'org.cups.printers.plist',
  items.sDaemons + 'bootps.plist',
  items.sDaemons + 'com.vix.cron.plist',
  items.sDaemons + 'org.apache.httpd.plist',
  items.sDaemons + 'org.cups.cups-lpd.plist',
  items.sDaemons + 'org.cups.cupsd.plist',
  items.sDaemons + 'org.net-snmp.snmpd.plist',
  items.sDaemons + 'org.openldap.slapd.plist',
  items.sDaemons + 'ntalk.plist',
  items.sDaemons + 'ssh.plist',
  items.sDaemons + 'tftp.plist',
  items.uAgents + 'com.google.keystone.agent.plist',
  items.daemons + 'com.oracle.oss.mysql.mysqld.plist',
  items.daemons + 'com.docker.vmnetd.plist'
]
export const blackList: blackItem[] = [
  {
    name: 'forticlient',
    mode: 'reg',
    path: '^com\.fortinet\.forticlient\..*',
    auth: {
      RunAtLoad: false
    }
  }
]