export type blackItem = {
  mode?: 'full'|'reg', // 完全匹配/正则匹配
  path: string,
  auth: {
    RunAtLoad?: boolean,
    OnDemand?: boolean,
    KeepAlive?: boolean,
    SuccessfulExit?: boolean
  } // 开机运行、后台运行、退出重启
}
export const blackList: {[key:string]: blackItem} = {
  forticlient: {
    mode: 'reg',
    path: '^com\.fortinet\.forticlient\..*',
    auth: {
      RunAtLoad: false
    }
  }
}
const operate: string[] = Object.keys(blackList)
export { operate }