import incmd from 'inquirer'
import { operate, blackList } from './operate'
import { lang } from './i18n'
import { edit, scan } from './common'

function getOperate() {
  let choices = []
  choices.push(lang.scan)
  for (const item of operate) {
    choices.push({
      name: lang.ban + item + lang.autorun,
      value: item
    })
  }
  choices.push(lang.exit)
  return incmd
    .prompt([{
      type: 'rawlist',
      name: 'operate',
      message: lang.msg,
      choices,
      pageSize: choices.length,
      default: lang.exit,
      loop: true
    }])
    .then(async val => {
      if (val.operate === lang.exit) return false
      else if (val.operate === lang.scan) {
        await scan()
        getOperate()
      } else {
        await edit(blackList[val.operate])
        getOperate()
      }
    }).catch(e => {
      console.log(e)
    })
}
getOperate()