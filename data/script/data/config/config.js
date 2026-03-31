import * as constants from '../constants.js'
import { updateToggleUI } from '../../system/utils/function.js'

export const config = {
  autoMatchEnabled:
    localStorage.getItem('autoMatchEnabled') !== null
      ? JSON.parse(localStorage.getItem('autoMatchEnabled'))
      : true,
  autoCatchInfo:
    localStorage.getItem('autoCatchInfo') !== null
      ? JSON.parse(localStorage.getItem('autoCatchInfo'))
      : false,
  reverseDateUpload:
    localStorage.getItem('reverseDateUpload') !== null
      ? JSON.parse(localStorage.getItem('reverseDateUpload'))
      : true,
}
export function registerConfig() {
  constants.autoCatchToggle.textContent = init(config.autoCatchInfo)
  constants.autoMatchToggle.textContent = init(config.autoMatchEnabled)
  constants.reverseUpload.textContent = init(config.reverseDateUpload)
  updateToggleUI()
}
function init(value) {
  return value ? '开' : '关'
}
