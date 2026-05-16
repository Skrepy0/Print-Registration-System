import * as constants from '../constants.js'
import { PAPER_SIZE_OPTIONS, DEFAULT_PAPER_SIZE_OPTIONS } from '../constants.js'
import { updateToggleUI } from '../../system/utils/function.js'
import {
  showToast,
  updatePaperTypeByPriceRule,
} from '../../system/utils/function.js'
export const getDefaultPriceRule = async () => {
  const rule = await window.electronAPI.getDefaultPriceRule()
  return rule
}
export const config = {
  autoMatchEnabled:
    localStorage.getItem('autoMatchEnabled') !== null
      ? JSON.parse(localStorage.getItem('autoMatchEnabled'))
      : true,
  autoCatchInfo:
    localStorage.getItem('autoCatchInfo') !== null
      ? JSON.parse(localStorage.getItem('autoCatchInfo'))
      : false,
  soundPrompt:
    localStorage.getItem('soundPrompt') !== null
      ? JSON.parse(localStorage.getItem('soundPrompt'))
      : true,
  reverseDateUpload:
    localStorage.getItem('reverseDateUpload') !== null
      ? JSON.parse(localStorage.getItem('reverseDateUpload'))
      : true,
  gradeUpload:
    localStorage.getItem('gradeUpload') !== null
      ? JSON.parse(localStorage.getItem('gradeUpload'))
      : true,
  autoFillPrice:
    localStorage.getItem('autoFillPrice') !== null
      ? JSON.parse(localStorage.getItem('autoFillPrice'))
      : true,

  autoPriceRule:
    localStorage.getItem('autoPriceRule') !== null
      ? JSON.parse(localStorage.getItem('autoPriceRule'))
      : await getDefaultPriceRule(),
}
updatePaperTypeByPriceRule()
export async function resetPriceRule() {
  config.autoPriceRule = await getDefaultPriceRule()
  localStorage.setItem('autoPriceRule', JSON.stringify(config.autoPriceRule))
  showToast('已重置价格规则')
  updatePaperTypeByPriceRule()
}
export function registerConfig() {
  constants.soundPromptToggle.textContent = init(config.soundPrompt)
  constants.autoCatchToggle.textContent = init(config.autoCatchInfo)
  constants.autoMatchToggle.textContent = init(config.autoMatchEnabled)
  constants.reverseUpload.textContent = init(config.reverseDateUpload)
  constants.gradeUpload.textContent = init(config.gradeUpload)
  constants.autoFillPrice.textContent = init(config.autoFillPrice)
  updateToggleUI()
}
function init(value) {
  return value ? '开' : '关'
}
